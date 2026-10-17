import { useState } from "react";
import api from "../../api/axios";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function AddStudent() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await api.post("/coach/students", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess(response.data.message || "Student registered successfully.");

      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Add Student</h2>
        <p className="mt-2 text-sm text-gray-400">Register a student under your coaching account.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div>
          <label htmlFor="student-name" className="mb-2 block text-sm font-medium text-gray-300">
            Student name
          </label>

          <input
            id="student-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            minLength={2}
            maxLength={80}
            autoComplete="name"
            required
            placeholder="Enter student's full name"
            className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
          />
        </div>

        <div>
          <label htmlFor="student-email" className="mb-2 block text-sm font-medium text-gray-300">
            Email address
          </label>

          <input
            id="student-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            maxLength={254}
            autoComplete="email"
            required
            placeholder="student@example.com"
            className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
          />
        </div>

        <div>
          <label htmlFor="student-password" className="mb-2 block text-sm font-medium text-gray-300">
            Temporary password
          </label>

          <input
            id="student-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            placeholder="Create a password"
            className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none focus:border-lime-400"
          />

          <p className="mt-2 text-xs text-gray-500">Share the temporary password securely with the student.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/20 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="rounded-lg border border-lime-500/20 bg-lime-950/30 p-3 text-sm text-lime-200">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-lime-300 px-5 py-3 font-bold text-gray-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Registering..." : "Register Student"}
        </button>
      </form>
    </section>
  );
}

export default AddStudent;
