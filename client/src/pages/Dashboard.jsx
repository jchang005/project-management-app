import React from "react";
import LogoutButton from "../components/LogoutButton";
import api from "../api/axios";
import { useState } from "react";

export default function Dashboard() {
  return (
    <div>
      <p>You are logged in</p>
      <LogoutButton />
    </div>
  );
}
