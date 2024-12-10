import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // Provides custom matchers for DOM nodes
import { BrowserRouter } from "react-router-dom"; // For routing context
import axios from "axios"; // Mock Axios
import Homepage from "../components/Homepage"; // Adjust path as necessary

jest.mock("axios");

describe("Homepage Component", () => {
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
    {
      _id: "2",
      firstname: "Jane",
      lastname: "Smith",
      age: 25,
      temperature: 24,
      humidity: 50,
      preferedHumidity: 55,
      preferedTemperature: 22,
    },
  ];

  beforeEach(() => {
    // Mock Axios response for fetching patient data
    axios.get.mockResolvedValue({ data: { data: mockPatientData } });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it("renders the header and buttons", async () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    // Check if the header and buttons are rendered
    expect(screen.getByText("Home Temperature Monitor")).toBeInTheDocument();
    expect(screen.getByText("Send Temperature Alert")).toBeInTheDocument();
  });

  it("fetches and displays patient data", async () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText("John's Bedroom")).toBeInTheDocument();
      expect(screen.getByText("Jane's Bedroom")).toBeInTheDocument();
    });

    // Check temperature and humidity values
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("24°C")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("handles toggling room details", async () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText("John's Bedroom")).toBeInTheDocument();
    });

    // Toggle details
    const toggleButton = screen.getByText("Details ▼");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("Current temperature:")).toBeInTheDocument();
    });

    // Collapse details
    const collapseButton = screen.getByText("Collapse ▲");
    fireEvent.click(collapseButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Current temperature:")
      ).not.toBeInTheDocument();
    });
  });

  it("sends a temperature alert", async () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    // Mock PubNub publish function
    const mockPublish = jest.fn().mockResolvedValue({});
    const pubnub = require("pubnub");
    pubnub.prototype.publish = mockPublish;

    // Click the alert button
    const alertButton = screen.getByText("Send Temperature Alert");
    fireEvent.click(alertButton);

    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith({
        channel: "pi_channel",
        message: { text: "Temperature is too high" },
      });
    });
  });
});
