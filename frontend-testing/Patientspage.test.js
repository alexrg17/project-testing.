import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // Provides custom matchers for DOM nodes
import { BrowserRouter } from "react-router-dom"; // For routing context
import axios from "axios"; // Mock Axios
import PatientPage from "../components/PatientPage"; // Adjust path as necessary

jest.mock("axios");

jest.mock("pubnub", () => {
  return jest.fn().mockImplementation(() => {
    return {
      history: jest.fn((options, callback) => {
        callback(null, {
          messages: [{ entry: { temperature: 22, humidity: 45 } }],
        });
      }),
    };
  });
});

describe("PatientPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form fields and buttons", () => {
    render(
      <BrowserRouter>
        <PatientPage />
      </BrowserRouter>
    );

    // Check for form fields and buttons
    expect(screen.getByText("Resident Details")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Age")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Temperature")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Humidity")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Preferred Humidity")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Preferred Temperature")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Priority")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
    render(
      <BrowserRouter>
        <PatientPage />
      </BrowserRouter>
    );

    const firstNameInput = screen.getByPlaceholderText("First name");
    const ageInput = screen.getByPlaceholderText("Age");
    const tempInput = screen.getByPlaceholderText("Temperature");
    const humidityInput = screen.getByPlaceholderText("Humidity");
    const priorityInput = screen.getByPlaceholderText("Priority");

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(ageInput, { target: { value: "25" } });
    fireEvent.change(tempInput, { target: { value: "22" } });
    fireEvent.change(humidityInput, { target: { value: "45" } });
    fireEvent.change(priorityInput, { target: { value: "High" } });

    expect(firstNameInput.value).toBe("John");
    expect(ageInput.value).toBe("25");
    expect(tempInput.value).toBe("22");
    expect(humidityInput.value).toBe("45");
    expect(priorityInput.value).toBe("High");
  });

  it("fetches data from PubNub on component load", async () => {
    render(
      <BrowserRouter>
        <PatientPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Temperature").value).toBe("22");
      expect(screen.getByPlaceholderText("Humidity").value).toBe("45");
    });
  });

  it("submits the form successfully", async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    render(
      <BrowserRouter>
        <PatientPage />
      </BrowserRouter>
    );

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Age"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByPlaceholderText("Temperature"), {
      target: { value: "22" },
    });
    fireEvent.change(screen.getByPlaceholderText("Humidity"), {
      target: { value: "45" },
    });
    fireEvent.change(screen.getByPlaceholderText("Preferred Humidity"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByPlaceholderText("Preferred Temperature"), {
      target: { value: "23" },
    });
    fireEvent.change(screen.getByPlaceholderText("Priority"), {
      target: { value: "High" },
    });

    // Click the submit button
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://thermochecker.onrender.com/admin/patient",
        {
          firstname: "John",
          age: "30",
          temperature: "22",
          humidity: "45",
          priority: "High",
          preferedHumidity: "50",
          preferedTemperature: "23",
        }
      );
      expect(mockNavigate).toHaveBeenCalledWith("/AdminHomepage");
    });
  });

  it("handles form submission errors", async () => {
    axios.post.mockRejectedValueOnce(
      new Error("Error submitting patient data")
    );

    render(
      <BrowserRouter>
        <PatientPage />
      </BrowserRouter>
    );

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Age"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByPlaceholderText("Temperature"), {
      target: { value: "22" },
    });

    // Click the submit button
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Check if the error was logged
    expect(console.log).toHaveBeenCalledWith(
      "Error submitting patient data request not goinng on try block :",
      expect.any(Error)
    );
  });
});
