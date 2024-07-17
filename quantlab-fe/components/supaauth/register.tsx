"use client";
import React from "react";
import Social from "./social";
import Image from "next/image";

export default function Register() {
	const queryString =
		typeof window !== "undefined" ? window?.location.search : "";
	const urlParams = new URLSearchParams(queryString);

	// Get the value of the 'next' parameter
	const next = urlParams.get("next");
	const verify = urlParams.get("verify");

	return (
		<div className="w-full sm:w-[26rem] shadow sm:p-5  border dark:border-zinc-800 rounded-md">
			<div className="p-5 space-y-5">
				<div className="text-center space-y-3">
					<Image
						src={"/logo.png"}
						alt="logo"
						width={50}
						height={50}
						className=" rounded-full mx-auto"
					/>
					<h1 className="font-bold">Authorize yourself</h1>
					
				</div>
				<Social redirectTo={next || "/"} />
				<div className="flex items-center gap-5">
					
				</div>
			</div>
		</div>
	);
}
