import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // For routing context
import Protectedroute from "../components/Protectedroute";
import jwtDecode from "jwt-decode";

jest.mock("jwt-decode"); // Mock jwt-decode for testing

describe("Protectedroute Component", () => {
  const mockNavigate = jest.fn();

  jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  }));

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("redirects if no token is found", () => {
    render(
      <BrowserRouter>
        <Protectedroute requiredRole="admin">
          <div>Protected Content</div>
        </Protectedroute>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("redirects if the token is expired", () => {
    const expiredToken = "expired.token";
    localStorage.setItem("adminToken", expiredToken);

    jwtDecode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) - 1000, // Expired timestamp
      role: "admin",
    });

    render(
      <BrowserRouter>
        <Protectedroute requiredRole="admin">
          <div>Protected Content</div>
        </Protectedroute>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(localStorage.getItem("adminToken")).toBeNull();
  });

  it("redirects if the user does not have the required role", () => {
    const tokenWithWrongRole = "valid.token";
    localStorage.setItem("adminToken", tokenWithWrongRole);

    jwtDecode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 1000, // Valid timestamp
      role: "user",
    });

    render(
      <BrowserRouter>
        <Protectedroute requiredRole="admin">
          <div>Protected Content</div>
        </Protectedroute>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders children if the token is valid and the role matches", () => {
    const validToken = "valid.token";
    localStorage.setItem("adminToken", validToken);

    jwtDecode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 1000, // Valid timestamp
      role: "admin",
    });

    const { getByText } = render(
      <BrowserRouter>
        <Protectedroute requiredRole="admin">
          <div>Protected Content</div>
        </Protectedroute>
      </BrowserRouter>
    );

    expect(getByText("Protected Content")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects if there is an error decoding the token", () => {
    const invalidToken = "invalid.token";
    localStorage.setItem("adminToken", invalidToken);

    jwtDecode.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    render(
      <BrowserRouter>
        <Protectedroute requiredRole="admin">
          <div>Protected Content</div>
        </Protectedroute>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
