import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // Provides custom matchers
import { BrowserRouter } from "react-router-dom"; // Required for <Link> and navigation
import axios from "axios"; // Mocking axios
import CreateLogin from "../components/CreateLogin"; // Adjust the import path as necessary

jest.mock("axios");

describe("CreateLogin Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form elements", () => {
    render(
      <BrowserRouter>
        <CreateLogin />
      </BrowserRouter>
    );

    // Check for form elements
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
    expect(screen.getByText("Submit Form")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });

  it("handles input changes", () => {
    render(
      <BrowserRouter>
        <CreateLogin />
      </BrowserRouter>
    );

    // Simulate user input
    const firstNameInput = screen.getByPlaceholderText("First name");
    const passwordInput = screen.getByPlaceholderText("Password");
    const emailInput = screen.getByPlaceholderText("Email");
    const addressInput = screen.getByPlaceholderText("Address");

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(passwordInput, { target: { value: "securepassword" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(addressInput, { target: { value: "123 Main St" } });

    expect(firstNameInput).toHaveValue("John");
    expect(passwordInput).toHaveValue("securepassword");
    expect(emailInput).toHaveValue("john@example.com");
    expect(addressInput).toHaveValue("123 Main St");
  });

  it("submits the form successfully and navigates to the login page", async () => {
    const mockNavigate = jest.fn(); // Mocking navigation
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    axios.post.mockResolvedValue({
      status: 200,
    });

    render(
      <BrowserRouter>
        <CreateLogin />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "securepassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Address"), {
      target: { value: "123 Main St" },
    });

    // Submit the form
    const submitButton = screen.getByText("Submit Form");
    fireEvent.click(submitButton);

    // Verify Axios post call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3200/user/create",
        {
          firstname: "John",
          password: "securepassword",
          email: "john@example.com",
          address: "123 Main St",
        }
      );
    });

    // Verify navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("handles form submission error", async () => {
    axios.post.mockRejectedValue(new Error("Network error"));

    render(
      <BrowserRouter>
        <CreateLogin />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "securepassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Address"), {
      target: { value: "123 Main St" },
    });

    // Submit the form
    const submitButton = screen.getByText("Submit Form");
    fireEvent.click(submitButton);

    // Verify Axios post call and error handling
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3200/user/create",
        {
          firstname: "John",
          password: "securepassword",
          email: "john@example.com",
          address: "123 Main St",
        }
      );
    });

    // Ensure no navigation occurs on error
    expect(screen.getByPlaceholderText("First name")).toHaveValue("John");
    expect(screen.getByPlaceholderText("Password")).toHaveValue(
      "securepassword"
    );
    expect(screen.getByPlaceholderText("Email")).toHaveValue(
      "john@example.com"
    );
    expect(screen.getByPlaceholderText("Address")).toHaveValue("123 Main St");
  });
});
