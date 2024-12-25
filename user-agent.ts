import { cache_path } from "./support";

const user_agents_location = cache_path("user-agents.txt");

export async function loadUserAgentFromGist() {
	if (await Bun.file(user_agents_location).exists()) {
		const user_agents = (await Bun.file(user_agents_location).text())
			.toString()
			.split("\n")
			.filter((line) => line.trim() !== "");
		if (user_agents.length > 0) {
			return user_agents;
		}
	}

	const HARD_CODED_USER_AGENTS = [
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
		"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
		"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
		"Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36 Edg/89.0.774.45",
		"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36 Edge/16.16299",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 OPR/45.0.2552.898",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Vivaldi/1.8.770.50",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:54.0) Gecko/20100101 Firefox/54.0",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/15.15063",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/15.15063",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36",
	];

	let user_agents: string[] = HARD_CODED_USER_AGENTS;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(
			"https://gist.githubusercontent.com/binsarjr/61c90a20226d0eb3000dba09376616f9/raw/4046f80c6967dedad031113478b9620fd8656d23/user-agent.txt",
			{ signal: controller.signal }
		);

		clearTimeout(timeoutId);

		if (response.ok) {
			const text = await response.text();

			user_agents = [
				...new Set([
					...user_agents,
					...text.split("\n").filter((line) => line.trim() !== ""),
				]),
			];
		} else {
			console.warn(
				`Failed to fetch user agents. HTTP status: ${response.status}`
			);
		}
	} catch (error: any) {
		if (error.name === "AbortError") {
			console.warn("Request timed out. Returning empty array.");
		} else {
			console.error("Error fetching user agents:", error);
		}
	} finally {
		await Bun.write(user_agents_location, user_agents.join("\n"));
		return user_agents;
	}
}
