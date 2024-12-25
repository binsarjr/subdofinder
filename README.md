# SubdoFinder

**SubdoFinder** is a simple tool to collect subdomains of a specific domain.

---

## Features

- Dump subdomains of a specific domain
- Support for multiple domains from a file
- Output results to a customizable directory

---

## Installation

1. Ensure you have [Bun](https://bun.sh) installed on your system.
2. Clone the repository:

```bash
$ git clone https://github.com/binsarjr/subdofinder
$ cd subdofinder
```

3. Install dependencies:

```bash
$ bun install
```

4. Link the tool globally (optional):

```bash
$ bun link
```


---

## Usage

```bash
Usage: subdofinder [options]

Dump subdomains of a domain

Options:
  -d, --domain <domain...>  Domain to dump
  -l, --list <list...>      List all subdomains files
  -o, --output <output>     Output directory (default: "./results")
  -h, --help                Display help for command
```

### Examples

1. Dump subdomains for a single domain:

   ```bash
   $ subdofinder -d example.com
   ```

2. Dump subdomains for multiple domains from a file:

   ```bash
   $ subdofinder -l domains.txt
   ```

3. Dump subdomains with output to a specific directory:

   ```bash
   $ subdofinder -d example.com -o ./output_directory
   ```

---

## Contribution

Contributions are welcome! Please fork this repository and submit a pull request with fixes or new features.
