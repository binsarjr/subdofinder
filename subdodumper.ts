#!/usr/bin/env bun

import chalk from "chalk";
import { program } from "commander";
import { mkdirSync } from "fs";
import loading, { type Loading } from "loading-cli";
import { join } from "path";
import { base_path } from "./support";
import { loadUserAgentFromGist } from "./user-agent";

declare global {
	var user_agents: string[];
	var result_dir: string;
	var loader: Loading;
}
globalThis.result_dir = "./results";

const HARD_CODED_EXCLUDE_SUBDOMAINS_STARTWITH = ["www.", "*."];

console.log(chalk.bold.blue(await Bun.file(base_path("ascii.txt")).text()));

const isValidDomain = (domain: string) => {
	if (!domain.startsWith("http://")) {
		domain = "http://" + domain;
	}

	try {
		new URL(domain);
		return true;
	} catch (error) {
		return false;
	}
};

const getHostName = (url: string) => {
	if (!url.startsWith("http://")) {
		url = "http://" + url;
	}
	const urlObj = new URL(url);
	return urlObj.hostname;
};

const crt = async (domain: string) => {
	if (!isValidDomain(domain)) {
		console.log(domain, chalk.red(" is invalid domain"));
		return [];
	}

	let MAX_RETRY = 10;

	while (true) {
		globalThis.loader = loading(
			"Searching all subdomain for " + chalk.blue(domain)
		).start();
		const response = await fetch(
			"https://crt.sh/json?q=" + getHostName(domain),
			{
				headers: {
					"user-agent":
						globalThis.user_agents[
							Math.floor(Math.random() * globalThis.user_agents.length)
						],
				},
			}
		);
		if (!response.ok) {
			MAX_RETRY--;
			if (MAX_RETRY <= 0) {
				globalThis.loader.fail(
					domain + chalk.red(" cannot be fetched, skipped...")
				);
				return [];
			}

			let MAX_SECONDS = 5;
			while (MAX_SECONDS-- > 0) {
				globalThis.loader.start(
					"Failed to fetch data for " +
						chalk.blue(domain) +
						" retrying in " +
						MAX_SECONDS +
						" seconds remining retry count is " +
						MAX_RETRY
				);
				await new Promise((resolve) => setTimeout(resolve, 1_000));
			}
			globalThis.loader.stop();
			continue;
		}

		const body = await response.text();
		const data = JSON.parse(body);

		const subdomains = new Set<string>();
		data.map(({ name_value }: { name_value: string }) => {
			name_value.split("\n").map((subdomain: string) => {
				subdomain = subdomain.trim();
				if (!subdomain.startsWith("*.")) {
					for (const exclude of HARD_CODED_EXCLUDE_SUBDOMAINS_STARTWITH) {
						if (subdomain.toLowerCase().startsWith(exclude.toLowerCase())) {
							return;
						}
					}

					if (isValidDomain(subdomain)) {
						subdomains.add(subdomain);
					}
				}
			});
		});

		globalThis.loader.succeed(
			"Found " + subdomains.size + " subdomains for " + chalk.blue(domain)
		);
		return [...subdomains];
	}
};

globalThis.user_agents = await loadUserAgentFromGist();

program.name("subdodumper").description("Dump subdomains of a domain");
program.option("-d, --domain <domain...>", "Domain to dump");
program.option("-l, --list <list...>", "List all subdomains files");
program.option(
	"-o, --output <output>",
	"Output directory",
	globalThis.result_dir
);

program.action(async (options) => {
	const domains = new Set<string>();
	if (!(options.list || options.domain)) {
		console.log(chalk.red("No domain or list provided please use -d or -l"));
		console.log(chalk.blue("Please use -h for help"));
		process.exit(1);
	}

	if (options.domain) {
		for (const domain of options.domain) {
			if (isValidDomain(domain)) {
				domains.add(domain);
			} else {
				console.warn(domain, chalk.red(" is invalid domain"));
			}
		}
	}

	if (options.list) {
		for (const filepath of options.list) {
			const file = await Bun.file(filepath).text();
			file.split("\n").map((domain: string) => {
				domain = domain.trim();
				if (!domain) return;

				if (isValidDomain(domain)) {
					domains.add(domain);
				} else {
					console.warn(domain, chalk.red(" is invalid domain"));
				}
			});
		}
	}

	globalThis.result_dir = options.output;
	if (!Bun.file(globalThis.result_dir).exists()) {
		mkdirSync(globalThis.result_dir, { recursive: true });
	}

	for (const domain of domains) {
		const subdomains = await crt(domain);
		if (subdomains.length > 0) {
			const loader = loading(
				"Saving results for " + chalk.blue(domain)
			).start();
			const output_location = join(globalThis.result_dir, domain + ".txt");
			await Bun.write(output_location, subdomains.join("\n"));
			loader.succeed(
				"Saved results for " +
					chalk.blue(domain) +
					" in " +
					chalk.blue(output_location)
			);
		}
	}
});
program.parse(process.argv);
