# 🏦 Banking System – TypeScript Reference Implementation

This repository contains a complete reference implementation of a multi-stage banking system simulation, originally designed as a technical interview exercise. It walks through four progressive design stages that test a candidate’s ability to build clean, correct, and extensible financial systems in TypeScript.

> 🔒 **Note:** This repository is **not accepting contributions** and is intended solely for reference and educational purposes.

---

## 📁 Project Structure

```
.
├── src/
│   ├── bankingSystem.ts         # Final implementation class
│   ├── transaction.ts           # Base interfaces and transaction types
│   ├── stage1.ts                # Stage 1 interface
│   ├── stage2.ts                # Stage 2 interface
│   ├── stage3.ts                # Stage 3 interface
│   └── stage4.ts                # Stage 4 interface
│
├── test/
│   ├── stage1.test.ts           # Tests for Stage 1
│   ├── stage2.test.ts           # Tests for Stage 2
│   ├── stage3.test.ts           # Tests for Stage 3
│   └── stage4.test.ts           # Tests for Stage 4
│
├── package.json
├── tsconfig.json
└── README.md
````

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
````

### 2. Run All Tests

```bash
npm run test-all
```

---

## ✅ Run Individual Stage Tests

| Stage   | Command               |
| ------- | --------------------- |
| Stage 1 | `npm run test-stage1` |
| Stage 2 | `npm run test-stage2` |
| Stage 3 | `npm run test-stage3` |
| Stage 4 | `npm run test-stage4` |

---

## 🛠 Implementation Highlights

This implementation covers the full scope of the exercise and is structured to demonstrate clarity, correctness, and scalability across multiple stages:

* **Stage 1:** Account creation, deposit, withdrawal, and balance tracking.
* **Stage 2:** Transaction volume calculation, sorted account ranking, and transaction history.
* **Stage 3:** Transfer requests between accounts with TTL-based expiration and explicit acceptance.
* **Stage 4:** Scheduling future transfers and processing them based on time.

The main `BankingSystem` class implements the interfaces incrementally and leverages clean, object-oriented design with domain-driven modeling of transaction types.

---

## 🧪 Test Environment

This project uses:

* [Mocha](https://mochajs.org/) – test runner
* [Chai](https://www.chaijs.com/) – assertions
* [ts-node](https://typestrong.org/ts-node/) – runtime TypeScript execution

All tests are written in TypeScript and located under the `test/` directory.

---

## 📌 Node & TypeScript Compatibility

This project is compatible with:

* Node.js ≥ 16
* TypeScript ≥ 4.5

---

## 📖 Educational Purpose

This implementation is intended to help engineers:

* Practice modular system design
* Improve TypeScript skills with interfaces and classes
* Demonstrate structured problem-solving in interviews

It is based on the template at:
🔗 [github.com/ashergarland/banking-system-ts-template](https://github.com/ashergarland/banking-system-ts-template)

---

## 📧 License

This project is provided for **educational and interview reference use only**.
No warranty or support is provided. All rights reserved by the original author.
