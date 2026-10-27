import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import * as api from "../../api.js";
import TimeEntryForm from "./TimeEntryForm.jsx";

const year = new Date().getFullYear();

const entry = {
  id: 7,
  taskId: 398,
  comment: "Meeting",
  start: `${year}-01-01T12:00:00.000Z`,
  end: `${year}-01-01T12:30:00.000Z`,
};

function renderForm(props) {
  const onSaved = vi.fn();
  render(
    <TimeEntryForm
      entry={null}
      taskId="398"
      taskName="Task 1"
      onTaskIdChange={() => {}}
      onSaved={onSaved}
      onCancel={() => {}}
      {...props}
    />,
  );
  return { onSaved };
}

describe("TimeEntryForm", () => {
  test("creates an entry and shows its id", async () => {
    const create = vi
      .spyOn(api, "createTimeEntry")
      .mockResolvedValue({ ...entry, id: 12 });
    const { onSaved } = renderForm();

    await userEvent.type(screen.getByLabelText("Comment"), "Meeting");
    await userEvent.click(screen.getByRole("button", { name: "Create entry" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Time entry #12 created",
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 398, comment: "Meeting" }),
    );
    expect(onSaved).toHaveBeenCalled();
  });

  test("fills the form when editing and saves with PUT", async () => {
    const update = vi.spyOn(api, "updateTimeEntry").mockResolvedValue(entry);
    renderForm({ entry });

    expect(screen.getByLabelText("Comment")).toHaveValue("Meeting");

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(update).toHaveBeenCalledWith(7, expect.any(Object));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Time entry #7 updated",
    );
  });

  test("shows the error from the server", async () => {
    vi.spyOn(api, "createTimeEntry").mockRejectedValue(
      new Error("Task #398 not found"),
    );
    const { onSaved } = renderForm();

    await userEvent.type(screen.getByLabelText("Comment"), "Meeting");
    await userEvent.click(screen.getByRole("button", { name: "Create entry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Task #398 not found",
    );
    expect(onSaved).not.toHaveBeenCalled();
  });
});
