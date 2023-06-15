build:
	. ~/.venv/bin/activate && python3 -m PyInstaller --onefile tomohauk.py
clean:
	rm -rf build
	rm -rf dist