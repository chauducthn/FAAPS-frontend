import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">FAAPS</h1>
        <Link 
          to="/login" 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Hệ thống Tư vấn Học thuật <span className="text-blue-600">FPT</span>
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Lập kế hoạch học tập, theo dõi tiến độ tốt nghiệp và nhận tư vấn trực tiếp từ AI & Cố vấn học tập.
        </p>
        <Link 
          to="/login" 
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}