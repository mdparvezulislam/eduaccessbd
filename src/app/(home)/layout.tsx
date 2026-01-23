
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function HomePagelayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" bg-black text-white ">
      {/* Sidebar Component we created earlier */}
          <Navbar />

      {/* Dynamic Page Content */}
      <main className="flex-1 lg:pl-4 w-full">
        <div className="p-0 md:p-2 mx-auto">
          {children}
                <Footer />
        </div>
      </main>
    </div>
  );
}