import React from "react"; 

export const SignInForm: React.FC = () => {
  return (
    <form className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition duration-200"
      >
            Sign In
      </button>
    </form>
  );
};