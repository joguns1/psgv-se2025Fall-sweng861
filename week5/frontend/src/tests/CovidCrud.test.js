import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import CovidCrud from "../pages/CovidCrud";


jest.mock("axios");

const mockStats = [
  { id: 1, country: "USA", cases: 100, deaths: 10, recovered: 50, active: 40 },
  { id: 2, country: "Canada", cases: 200, deaths: 20, recovered: 100, active: 80 }
];

describe("CovidCrud Component", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockStats });
  });

  // 1. Component renders without crashing
  test("renders dashboard header", async () => {
    render(<CovidCrud />);
    expect(await screen.findByText("COVID CRUD Dashboard")).toBeInTheDocument();
  });

  // 2. Fetch saved data populates table
  test("displays saved records from API", async () => {
    render(<CovidCrud />);
    expect(await screen.findByText("USA")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
  });

  // 3. Live data button works
  test("fetch live data triggers API call", async () => {
    axios.get.mockResolvedValueOnce({}); // /covid/fetch
    render(<CovidCrud />);
    fireEvent.click(screen.getByText(/Fetch Live Data/i));
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  // 4. Adding a record calls POST API
  test("adds a new record", async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 3, country: "UK" } });
    render(<CovidCrud />);
    fireEvent.change(screen.getByPlaceholderText("Country"), {
      target: { value: "UK" }
    });
    fireEvent.change(screen.getByPlaceholderText("Cases"), {
      target: { value: "300" }
    });
    fireEvent.click(screen.getByText("Add Record"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  // 5. Editing a record prefills form
  test("prefills form when editing", async () => {
    render(<CovidCrud />);
    const editBtn = await screen.findAllByText("Edit");
    fireEvent.click(editBtn[0]);
    expect(screen.getByDisplayValue("USA")).toBeInTheDocument();
  });

  // 6. Updating a record calls PUT API
  test("updates a record", async () => {
    axios.put.mockResolvedValueOnce({});
    render(<CovidCrud />);
    const editBtn = await screen.findAllByText("Edit");
    fireEvent.click(editBtn[0]);
    fireEvent.change(screen.getByPlaceholderText("Cases"), {
      target: { value: "500" }
    });
    fireEvent.click(screen.getByText("Update Record"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  // 7. Deleting a record calls DELETE API
  test("deletes a record", async () => {
    axios.delete.mockResolvedValueOnce({});
    render(<CovidCrud />);
    const deleteBtn = await screen.findAllByText("Delete");
    fireEvent.click(deleteBtn[0]);
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
  });

  // 8. Error when fetching saved records
  test("shows error when fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    render(<CovidCrud />);
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Error fetching saved records")
    );

  });

  // 9. Error when adding a record
  test("shows error when add fails", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: "fail" } } });
    render(<CovidCrud />);
    fireEvent.change(screen.getByPlaceholderText("Country"), {
      target: { value: "Spain" }
    });
    fireEvent.click(screen.getByText("Add Record"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  // 10. Shows correct table headers
  test("renders all table headers", async () => {
    render(<CovidCrud />);
    const headers = ["Country", "Cases", "Deaths", "Recovered", "Active", "Actions"];
    for (const header of headers) {
      expect(await screen.findByText(header)).toBeInTheDocument();
    }
  });
});

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

test("renders dashboard title", async () => {
  axios.get.mockResolvedValueOnce({ data: [] });

  render(<CovidCrud />);

  expect(screen.getByText(/COVID CRUD Dashboard/i)).toBeInTheDocument();
});

