# LokiHTMX

  
<img src="https://jmbarnes1.github.io/lokihtmx/lokijs.webp" alt="LokiHTMX" width="200">
*A lightweight HTMX-based web project powered by LokiJS.*

## Overview
LokiHTMX is a client-side application that leverages **HTMX** and **LokiJS** to create a dynamic, database-driven experience without requiring a backend server. It is designed for fast, in-browser data management with minimal dependencies.

## Features
- **HTMX-powered UI updates** – No need for full-page reloads
- **LokiJS integration** – A fast, in-memory JavaScript database
- **Persistent Data Storage** – Data is stored in the browser's **localStorage**, ensuring it remains intact across sessions
- **Lightweight & efficient** – Minimal external dependencies
- **Easy to extend** – Customize for various use cases
- **Offline-first capability (with limitations)** – Data persists offline, but HTMX requests may require a local server

## Live Demo
[Check it out here](https://jmbarnes1.github.io/lokihtmx/)

## Installation
To run LokiHTMX locally:

```bash
# Clone the repository
git clone https://github.com/jmbarnes1/lokihtmx.git
cd lokihtmx

# Open index.html in a browser
```

Since LokiHTMX is a frontend-only project, there are no additional setup steps beyond opening the `index.html` file.

## Running Locally
To run LokiHTMX on your local machine, you need a simple web server. If you open `index.html` directly (using `file://`), some HTMX features may not work as expected.

### **Option 1: Using Something like Simple Web Server **
If you're on Windows, you can use the **Simple Web Server** app or the equivalent. Just point it to your project folder and start the server.

### **Option 2: Using Python's Built-in Server**
If you have Python installed, you can start a quick web server in the project directory:

#### **For Python 3:**
```bash
python -m http.server 8000
```
#### **For Python 2:**
```bash
python -m SimpleHTTPServer 8000
```
Then, open `http://localhost:8000` in your browser.

### **Option 3: Using Node.js' http-server**
If you have Node.js installed, you can install `http-server` and run:
```bash
npx http-server
```

## Usage
1. Open `index.html` in your preferred web browser.
2. Interact with the dynamic UI elements powered by HTMX and LokiJS.
3. Data entered is **persistently stored in localStorage**, so it remains available even after closing and reopening the browser.
4. Modify the project to fit your needs by editing the HTML, JS, or CSS files.

## Contributing
We welcome contributions! To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Make your changes and commit (`git commit -m "Describe changes"`)
4. Push your changes (`git push origin feature-name`)
5. Submit a pull request

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
- **GitHub Repository:** [LokiHTMX Repo](https://github.com/jmbarnes1/lokihtmx)
- **Website:** [LokiHTMX](https://jmbarnes1.github.io/lokihtmx/)

---

Feel free to suggest edits or enhancements! 🚀

