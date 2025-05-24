# Banking System – TypeScript Interview Template

This project simulates a multi-stage banking system design and implementation exercise, ideal for technical interviews. It is structured in four progressive stages, each adding complexity and testing your ability to extend functionality in a maintainable way.

---

## 📦 Project Structure

```

.
├── src/
│   ├── bankingSystem.ts         # Your implementation goes here
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

## ✅ Run Individual Stages

You can run tests for individual stages using the following commands:

| Stage   | Command               |
| ------- | --------------------- |
| Stage 1 | `npm run test-stage1` |
| Stage 2 | `npm run test-stage2` |
| Stage 3 | `npm run test-stage3` |
| Stage 4 | `npm run test-stage4` |

---

## 🛠 Recommended Workflow

1. **Start with `stage1.ts` and `stage1.test.ts`.**
2. Implement the `BankingSystem` class incrementally.
3. Once all Stage 1 tests pass, move on to `stage2.ts` and `stage2.test.ts`, and so on.
4. **Each stage builds on the last**—do not remove or rewrite previous methods unless refactoring for correctness or extensibility.

---

## 🧪 Test Runner

This project uses:

* [Mocha](https://mochajs.org/) as the test runner
* [Chai](https://www.chaijs.com/) for assertions
* [ts-node](https://typestrong.org/ts-node/) for TypeScript execution without pre-compilation

All tests are written in TypeScript and located in the `test/` directory.

---

## ✍️ Notes for Interviewers

* Each stage is designed to reflect increasingly complex real-world engineering constraints.
* The problems emphasize **state management**, **consistency**, and **robust edge case handling**.
* The codebase avoids over-specification—interviewees are expected to demonstrate thoughtful design and error handling.

---

## 📧 License

This project is provided for educational and interview use only.

```

---