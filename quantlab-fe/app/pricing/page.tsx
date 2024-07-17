import Price from "@/components/subscription/Price";

export default function Home() {
    return (
        <>
        <h1> Pricing Page </h1>

        <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Price />
        </div>
        </>
    );
}