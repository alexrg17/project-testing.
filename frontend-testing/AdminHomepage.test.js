import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // Provides custom matchers for DOM nodes
import axios from "axios";
import AdminHomepage from "../components/AdminHomepage";
import { act } from "react-dom/test-utils";

// Mock Axios
jest.mock("axios");

describe("AdminHomepage Component", () => {
  const mockPatientData = [
    {
      _id: "1",
      firstname: "John",
      lastname: "Doe",
      age: 30,
      temperature: 22,
      humidity: 40,
      preferedHumidity: 50,
      preferedTemperature: 25,
    },
  ];

  beforeEach(() => {
    // Mock the GET request to fetch patient data
    axios.get.mockResolvedValue({ data: { data: mockPatientData } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the header and buttons", async () => {
    await act(async () => {
      render(<AdminHomepage />);
    });

    expect(screen.getByText("Home Temperature Monitor")).toBeInTheDocument();
    expect(screen.getByText("Send Temperature Alert")).toBeInTheDocument();
    expect(screen.getByText("Add New Room")).toBeInTheDocument();
  });

  it("fetches and displays patient data", async () => {
    await act(async () => {
      render(<AdminHomepage />);
    });

    expect(screen.getByText("John's Bedroom")).toBeInTheDocument();
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("handles toggling room details", async () => {
    await act(async () => {
      render(<AdminHomepage />);
    });

    const toggleButton = screen.getByText("Details ▼");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("Current temperature: 22°C")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Collapse ▲"));
    await waitFor(() => {
      expect(
        screen.queryByText("Current temperature: 22°C")
      ).not.toBeInTheDocument();
    });
  });

  it("opens and interacts with the edit modal", async () => {
    await act(async () => {
      render(<AdminHomepage />);
    });

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Enter name"), {
      target: { value: "Jane" },
    });

    const submitButton = screen.getByText("Submit");
    axios.put.mockResolvedValue({ status: 200 });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(axios.put).toHaveBeenCalledWith(
      "https://thermochecker.onrender.com/admin/update",
      expect.objectContaining({
        firstname: "Jane",
      }),
      expect.any(Object)
    );
  });

  it("handles delete action", async () => {
    await act(async () => {
      render(<AdminHomepage />);
    });

    const deleteButton = screen.getByText("Delete");
    axios.delete.mockResolvedValue({ status: 200 });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(axios.delete).toHaveBeenCalledWith(
      "https://thermochecker.onrender.com/admin/delete",
      expect.objectContaining({
        data: { Id: "1" },
      }),
      expect.any(Object)
    );
  });
});
