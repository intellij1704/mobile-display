"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function ContactUs() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
    setValue,
    watch,
  } = useForm({
    mode: "onChange", // Validate on input change
  });

  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });

  const messageValue = watch("message") || "";

  // Effect to clear success message after 5 seconds
  useEffect(() => {
    if (formStatus.type === "success") {
      const timer = setTimeout(() => {
        setFormStatus({ type: "", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const onSubmit = async (data) => {
    setLoading(true);
    setFormStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setFormStatus({
          type: "success",
          message: "Your message has been sent successfully!",
        });
        reset();
      } else {
        setFormStatus({
          type: "error",
          message: "Failed to send your message. Try again.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setFormStatus({ type: "error", message: "Something went wrong. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  // Restrict names to letters and spaces only
  const handleNameInput = (e, field) => {
    const value = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
    setValue(field, value, { shouldValidate: true });
  };

  // Restrict phone number to digits only (with optional +)
  const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/[^0-9+]/g, "");
    setValue("phone", value, { shouldValidate: true });
  };

  // Restrict message length to 300 chars
  const handleMessageChange = (e) => {
    const value = e.target.value.slice(0, 300);
    setValue("message", value, { shouldValidate: true });
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
              <span className="text-base"><a href="tel:+919433562200">+91-9433562200</a></span>
            </li>
            <li className="flex items-center gap-4">
              <span className="w-6 h-6 flex-shrink-0">
                <img src="/email-icon.svg" alt="email" className="w-full h-full object-contain" />
              </span>
              <span className="text-base"><a href="mailto:mobiledisplaykol@gmail.com">mobiledisplaykol@gmail.com</a></span>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-6 h-6 mt-1 flex-shrink-0">
                <img src="/map.svg" alt="map" className="w-full h-full object-contain" />
              </span>
              <span className="text-base leading-relaxed">
                BA-38, Salt Lake Rd, Sector-1, Bidhannagar, Kolkata – 700064
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
                {...register("firstName", {
                  required: "First name is required",
                  pattern: {
                    value: /^[A-Za-z\s'-]+$/,
                    message: "Please enter a valid name",
                  },
                })}
                onChange={(e) => handleNameInput(e, "firstName")}
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
                {...register("lastName", {
                  required: "Last name is required",
                  pattern: {
                    value: /^[A-Za-z\s'-]+$/,
                    message: "Please enter a valid name",
                  },
                })}
                onChange={(e) => handleNameInput(e, "lastName")}
                placeholder="Doe"
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
                placeholder="1234567890"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\+?[0-9]{10,15}$/,
                    message: "Enter a valid phone number (10-15 digits)",
                  },
                })}
                onChange={handlePhoneInput}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Message</label>
            <textarea
              {...register("message", {
                required: "Message is required",
                maxLength: {
                  value: 300,
                  message: "Message cannot exceed 300 characters",
                },
              })}
              rows="4"
              value={messageValue}
              onChange={handleMessageChange}
              placeholder="Write your message.."
              className="w-full border-b border-gray-400 focus:outline-none focus:border-red-500 py-1"
            />
            <div className="flex justify-between text-sm mt-1">
              <p className="text-red-600 h-4">
                {errors.message && errors.message.message}
              </p>
              <span className="text-gray-500">
                {messageValue.length}/300
              </span>
            </div>
          </div>

          <div className="text-right flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`sm:mx-0 flex items-center justify-center gap-2 ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                } text-white font-medium px-6 py-2 rounded transition`}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </div>

          {formStatus.message && (
            <p
              className={`text-center mt-4 font-medium ${formStatus.type === "success"
                ? "text-green-600"
                : "text-red-600"
                }`}
            >{formStatus.message}</p>
          )}
        </form>
      </div>

      {/* Map */}
      <div className="max-w-7xl mx-auto h-[500px] rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          className="rounded-lg"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=1st%20Floor,%20BA-38,%20Salt%20Lake%20Rd,%20near%20PNB,%20BA%20Block,%20Sector%201,%20Bidhannagar,%20Kolkata,%20West%20Bengal%20700064&output=embed"
          style={{ filter: "grayscale(0) contrast(1.2) opacity(100%)" }}
        ></iframe>
      </div>
    </section>
  );
}