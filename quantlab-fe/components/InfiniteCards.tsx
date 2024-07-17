"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

export function InfiniteCards() {
    return (

        <div id="reviews" className="h-[40rem] rounded-md bg-neutral-950  bg-grid-white/[0.05] flex flex-col antialiased  items-center justify-center relative overflow-hidden">

            <h2 className="pb-20  z-10 text-lg md:text-4xl  bg-clip-text text-gray-300 text-gradient-to-b from-gray-200 to-gray-400  text-center ">
                From People we provided value to
            </h2>

            <InfiniteMovingCards
                items={testimonials}
                direction="right"
                speed="slow"
            />
        </div>

    );
}

const testimonials = [
    {
        quote:
            "This platform is a game-changer for anyone studying quant finance! The variety and depth of the practice questions have significantly improved my understanding and skills.",
        name: "Arun Patro",
        title: "Ramp",
    },
    {
        quote:
            "The user-friendly interface and detailed explanations for each question make learning so much easier. I’ve gained so much confidence in my problem-solving abilities.",
        name: "Vignesh Valliyur",
        title: "Hamlet",
    },
    {
        quote: "Thanks to this platform, I aced my recent finance exam! The real-world scenarios and adaptive learning technology are incredibly effective.",
        name: "Sarthak Gaud",
        title: "Student",
    },
    {
        quote:
            "The playlist feature is a game changer! I can easily organize my questions. I’ve never been more organized in my life.",
        name: "Kevin Levrone",
        title: "BlackRock",
    },
    {
        quote:
            "The Quality of questions available here is unmatched. It’s the best investment I’ve made in my finance education journey.",
        name: "Jay Cuttler",
        title: "JP Morgan",
    },
];
