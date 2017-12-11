# CSRF Demonstration

These two node.js projects demonstrate how CSRF Attacks work.

## Installation
- Dowload and Install node.js https://nodejs.org/en/
- Clone this GitHub Repository to a local project folder
- Setup mySQL Database with dml and ddl
- Open your console and navigate to your project folder
  - Execute "npm install" to install all dependencies
  - Navigate to subfolder CSRF_Protected or CSRF
    - Execute "node server.js" to start the website
  - Website is aviable under http://localhost:8888

## Use
Register and login on site.

- If you are running the CSRF Project, you can open the page csrf.html in order to execute a CSRF attack that changes the password.
- If you are running the CSRF_Protected project, try to open the csrf.html page. The attack will fail, the site uses CSRF Tokens and is protected.
