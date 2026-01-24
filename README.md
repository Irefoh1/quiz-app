# DevOps Quiz App

A simple quiz application to test your DevOps and Cloud knowledge. Built for demonstrating CI/CD pipelines with GitHub Actions.

## Features

- Multiple categories: DevOps, Cloud, Linux, Docker, Kubernetes, Git, Networking
- 20 questions covering various topics
- Score tracking and answer review
- RESTful API backend
- Responsive design

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, JavaScript
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions
- **Containerization:** Docker

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

git clone https://github.com/YOUR_USERNAME/quiz-app.git
cd quiz-app
npm install 


### Running Locally
``` npm start ```

Visit http://localhost:3000

### Running With Docker 
```docker build -t quiz-app . ```
```docker run -p 3000:3000 quiz-app ```

### CI/CD Pipeline
This project includes a complete CI/CD pipeline with:

1. **Linting**- Code quality checks
2. **Testing** - Automated unit tests
3. **Security Scanning** - Vulnerability checks
4. **Docker Build** - Container image creation
6. **Deployment** - Staging and Production

This application is running in at
https://quiz-app-app.vercel.app/

### License
MIT

For more insights, please reach out to me on linkedin 
https://www.linkedin.com/in/irefohanuwa