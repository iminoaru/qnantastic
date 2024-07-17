"use client";
import Image from "next/image";
import React from "react";
import { WobbleCard } from "./ui/wobble-card";

export function WobbleCards() {
    return (
        <div className="bg-neutral-950">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-32 pb-12 max-w-7xl mx-auto w-full ">
            <WobbleCard
                containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
                className=""
            >
                <div className="max-w-xs">
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        The best Quant finance questions
                    </h2>
                    <p className="mt-4 text-left  text-base/6 text-neutral-200">
                        With over 200 quant finance questions from most frequently asked topics.
                    </p>
                </div>

            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 min-h-[300px]">
                <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    No ads, No BS. Just Quality questions
                </h2>
                <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
                    We dont show ads, we dont sell your data. We just help you ace your quant.
                </p>
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
                <div className="max-w-sm">
                    <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        The best of the best companies are waiting for you.
                    </h2>
                    <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
                        solve questions regularly and ace it!
                    </p>
                </div>
                <Image
                    src="/img.png"
                    width={800}
                    height={600}
                    alt="linear demo image"
                    className="absolute -right-10 md:-right-[20%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
                />
            </WobbleCard>
        </div>
        </div>
    );
}
