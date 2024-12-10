import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // Provides custom matchers for DOM nodes
import { BrowserRouter } from "react-router-dom"; // For routing context
import axios from "axios"; // Mock Axios
import Login from "../components/Login"; // Adjust path as necessary

jest.mock("axios");

describe("Login Component", () => {
  beforeEach(() => {
    axios.post.mockClear(); // Clear mock calls before each test
  });

  it("renders the login form", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Check if the header and form fields are rendered
    expect(screen.getByText("Home Temperature Monitor")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText("Admin Login")).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("submits login form successfully", async () => {
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { token: "mockToken" },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByText("Submit");

    // Fill out form and submit
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    // Wait for Axios call and navigation
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://thermochecker.onrender.com/user/login",
        {
          email: "test@example.com",
          password: "password123",
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith("User", "mockToken");
      expect(mockNavigate).toHaveBeenCalledWith("/Homepage");
    });
  });

  it("handles login errors", async () => {
    axios.post.mockRejectedValueOnce(new Error("Login failed"));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByText("Submit");

    // Fill out form and submit
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    fireEvent.click(submitButton);

    // Wait for Axios call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://thermochecker.onrender.com/user/login",
        {
          email: "test@example.com",
          password: "wrongpassword",
        }
      );
    });

    // Check that error was logged
    expect(console.log).toHaveBeenCalledWith(
      "data not got properly check frontend request",
      expect.any(Error)
    );
  });
});
