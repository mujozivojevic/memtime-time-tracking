import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { validateTimeEntryInput } from "../src/validation/timeEntry.validation.js";

const year = new Date().getUTCFullYear();

const valid = {
  taskId: 1,
  comment: " Meeting ",
  start: `${year}-01-01T14:00:00+02:00`,
  end: `${year}-01-01T14:30:00+02:00`,
};

describe("validateTimeEntryInput", () => {
  test("returns a cleaned entry for valid input", () => {
    assert.deepEqual(validateTimeEntryInput(valid), {
      taskId: 1,
      comment: "Meeting",
      start: `${year}-01-01T12:00:00.000Z`,
      end: `${year}-01-01T12:30:00.000Z`,
    });
  });

  test("rejects an entry from a previous year", () => {
    assert.throws(
      () =>
        validateTimeEntryInput({
          ...valid,
          start: `${year - 1}-12-31T10:00:00Z`,
        }),
      { statusCode: 400, message: `Start must be in ${year} or later` },
    );
  });

  test("rejects an end in the future", () => {
    assert.throws(
      () =>
        validateTimeEntryInput({
          ...valid,
          end: `${year + 1}-01-01T10:00:00Z`,
        }),
      { statusCode: 400, message: "End cannot be in the future" },
    );
  });

  test("returns capitalized messages", () => {
    assert.throws(
      () => validateTimeEntryInput({ ...valid, end: valid.start }),
      {
        message: "End must be after start",
      },
    );
  });

  const invalidCases = [
    ["input is null", null],
    ["input is an array", []],
    ["input is a string", "entry"],
    ["taskId is 0", { ...valid, taskId: 0 }],
    ["taskId is negative", { ...valid, taskId: -1 }],
    ["taskId is a decimal", { ...valid, taskId: 1.5 }],
    ["taskId is a string", { ...valid, taskId: "5" }],
    ["taskId is missing", { ...valid, taskId: undefined }],
    ["comment is missing", { ...valid, comment: undefined }],
    ["comment is blank", { ...valid, comment: "   " }],
    ["comment is too long", { ...valid, comment: "x".repeat(501) }],
    ["start has no time zone", { ...valid, start: `${year}-01-01T14:00:00` }],
    ["start is February 30", { ...valid, start: `${year}-02-30T10:00:00Z` }],
    ["end equals start", { ...valid, end: valid.start }],
    ["end is before start", { ...valid, end: `${year}-01-01T13:00:00+02:00` }],
  ];

  for (const [name, input] of invalidCases) {
    test(`rejects when ${name}`, () => {
      assert.throws(() => validateTimeEntryInput(input), { statusCode: 400 });
    });
  }
});
