import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // Provides custom matchers
import { BrowserRouter } from "react-router-dom"; // For <Link> to work
import axios from "axios"; // Mocking axios
import AdminloginPage from "../components/AdminloginPage"; // Update path as necessary

jest.mock("axios");

describe("AdminloginPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(
      <BrowserRouter>
        <AdminloginPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByText("ThermoChecker")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Back to User Login Page")).toBeInTheDocument();
  });

  it("handles input changes for email and password", () => {
    render(
      <BrowserRouter>
        <AdminloginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("submits the form successfully and navigates to AdminHomepage", async () => {
    const mockNavigate = jest.fn(); // Mocking navigation
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    axios.post.mockResolvedValue({
      status: 200,
      data: { token: "mockAdminToken" },
    });

    render(
      <BrowserRouter>
        <AdminloginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "securepassword" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3200/admin/adminlogin",
        {
          email: "admin@example.com",
          password: "securepassword",
        }
      );
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "adminToken",
        "mockAdminToken"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/AdminHomepage");
    });
  });

  it("handles form submission error", async () => {
    axios.post.mockRejectedValue(new Error("Invalid login credentials"));

    render(
      <BrowserRouter>
        <AdminloginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3200/admin/adminlogin",
        {
          email: "wrong@example.com",
          password: "wrongpassword",
        }
      );
    });

    // Ensure no token is set in localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
