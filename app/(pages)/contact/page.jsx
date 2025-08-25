"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

export default function ContactUs() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const onSubmit = (data) => {
    setLoading(true);
    setSuccess("");

    console.log("Form Data:", data);

    // Fake API call simulation
    setTimeout(() => {
      setLoading(false);
      setSuccess("Your message has been sent successfully");
      reset(); // clear form after success
    }, 2000);
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-100 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="md:text-5xl mb-5 font-bold text-gray-800">Contact Us</h2>
        <p>Any question or remarks? Just write us a message!</p>
      </div>

      <div className="max-w-5xl p-2 mx-auto bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row mb-10">
        {/* Left */}
        <div
          className="text-white p-8 w-full lg:w-1/2 bg-cover bg-center flex flex-col justify-between rounded-lg"
          style={{ backgroundImage: 'url(/contact-bg.png)' }}
        >
          <div>
            <h3 className="text-2xl font-bold mb-2">Contact Information</h3>
            <p className="mb-6 text-sm text-gray-300">Say something to start a live chat!</p>
          </div>
          <ul className="space-y-10 text-[16px] text-gray-100">
            <li className="flex items-center gap-4">
              <span className="w-6 h-6 flex-shrink-0">
                <img src="/call-icon.svg" alt="call" className="w-full h-full object-contain" />
              </span>
              <span className="text-base">+1012 3456 789</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="w-6 h-6 flex-shrink-0">
                <img src="/email-icon.svg" alt="email" className="w-full h-full object-contain" />
              </span>
              <span className="text-base">demo@gmail.com</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-6 h-6 mt-1 flex-shrink-0">
                <img src="/map.svg" alt="map" className="w-full h-full object-contain" />
              </span>
              <span className="text-base leading-relaxed">
                132 Dartmouth Street<br />Boston, Massachusetts 02156<br />United States
              </span>
            </li>
          </ul>
        </div>

        {/* Right */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full lg:w-2/3 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">First Name</label>
              <input
                type="text"
                {...register("firstName", { required: "First name is required" })}
                placeholder="John"
                className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                {...register("lastName", { required: "Last name is required" })}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 123456789"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9\s+-]+$/,
                    message: "Invalid phone number",
                  },
                })}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Message</label>
            <textarea
              {...register("message", { required: "Message is required" })}
              rows="4"
              placeholder="Write your message.."
              className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
            />
            {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              } text-white font-medium px-6 py-2 rounded transition`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>

          {/* Success Message */}
          {success && <p className="text-green-600 text-center mt-4 font-medium">{success}</p>}
        </form>
      </div>

      {/* Map */}
      <div className="max-w-7xl mx-auto h-[500px] rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          className="rounded-lg"
          src="https://maps.google.com/maps?q=kolkata&output=embed"
          style={{ filter: "grayscale(0) contrast(1.2) opacity(100%)" }}
        ></iframe>
      </div>
    </section>
  );
}
