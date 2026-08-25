In this directory you will find some tools and scripts that might be useful for the development of the AridLink firmware.

## Basic usage:
- In the `/tools` directory, run: `python3 -m venv .venv`, to create the venv.
- If you're on macOS or Linux, run: `source ./.venv/bin/activate`
- If you're on Windows, run `.\.venv\Scripts\Activate.ps1` in PowerShell
- To install dependencies, once the venv is activated, run `pip install -r requirements.txt`
- Finally, run the tool you want with `python3 ./[tool_name].py`
- To deactivate the venv once you're done, simply run `deactivate`.

Some tools are interactive and ask for input.

## What is each tool for?
- `/memlog`: Memlog and memlog plotter, allow you to log the heap usage of the MCU over time.
  
  To use it, enable the memlog component in `idf.py menuconfig` under AridLink Development

## License
Like the rest of the firmware files, the tools are also licensed under GPLv3.

See [LICENSE](../LICENSE) for more information.