import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Branch from "./Branch.jsx";

function renderBranch(load) {
  render(
    <ul>
      <Branch
        label="Client 1"
        emptyText="No projects"
        load={load}
        renderItem={(item) => <li key={item.id}>{item.name}</li>}
      />
    </ul>,
  );
}

describe("Branch", () => {
  test("loads its children when opened", async () => {
    const load = vi.fn().mockResolvedValue([{ id: 1, name: "Project 1" }]);
    renderBranch(load);

    expect(load).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /Client 1/ }));

    expect(await screen.findByText("Project 1")).toBeInTheDocument();
  });

  test("does not load again when reopened", async () => {
    const load = vi.fn().mockResolvedValue([{ id: 1, name: "Project 1" }]);
    renderBranch(load);
    const toggle = screen.getByRole("button", { name: /Client 1/ });

    await userEvent.click(toggle);
    await screen.findByText("Project 1");
    await userEvent.click(toggle);
    await userEvent.click(toggle);

    expect(load).toHaveBeenCalledTimes(1);
  });

  test("shows the error when loading fails", async () => {
    const load = vi.fn().mockRejectedValue(new Error("Memtime is down"));
    renderBranch(load);

    await userEvent.click(screen.getByRole("button", { name: /Client 1/ }));

    expect(await screen.findByText("Memtime is down")).toBeInTheDocument();
  });
});
