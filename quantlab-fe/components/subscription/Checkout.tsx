"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { checkout } from "@/lib/actions/stripe";
import { loadStripe } from "@stripe/stripe-js";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "@/lib/utils";
import useStore from "@/useStore";

export default function Checkout({ priceId }: { priceId: string }) {
	const { userID, email } = useStore();
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleCheckout = async () => {
		if (userID) {
			setLoading(true);
			const data = JSON.parse(
				await checkout(
					email || "",
					priceId,
					location.origin + location.pathname
				)
			);
			const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);
			const res = await stripe?.redirectToCheckout({
				sessionId: data.id,
			});

            console.log(res);
			if (res?.error) {
				alert("Fail to checkout");
			}
			setLoading(false);
		} else {
			router.push("/register?next=" + location.pathname);
		}
	};

	return (
		<Button
			className="w-full flex items-center gap-2"
			onClick={handleCheckout}
		>
			Getting Started{" "}
			<AiOutlineLoading3Quarters
				className={cn(" animate-spin", loading ? "block" : "hidden")}
			/>
		</Button>
	);
}