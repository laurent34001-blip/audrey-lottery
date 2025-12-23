import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative text-center max-w-4xl px-4">
        {/* Logo */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <svg className="w-10 h-10 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Bollet Lottery
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 md:mb-12 font-medium px-4">
          Découvrez vos résultats de loterie en toute simplicité
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white/80 backdrop-blur-lg p-4 md:p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">🎯</div>
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-gray-800">Résultats en direct</h3>
            <p className="text-gray-600 text-xs md:text-sm">Consultez les derniers résultats de loterie</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg p-4 md:p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">📅</div>
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-gray-800">Historique complet</h3>
            <p className="text-gray-600 text-xs md:text-sm">Parcourez l'historique mois par mois</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg p-4 md:p-6 rounded-2xl shadow-lg border border-white/20 sm:col-span-2 lg:col-span-1">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">🔒</div>
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-gray-800">Sécurisé</h3>
            <p className="text-gray-600 text-xs md:text-sm">Vos données sont protégées</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-base md:text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-6 md:px-8 py-3 md:py-4 bg-white/80 backdrop-blur-lg text-purple-600 rounded-xl font-bold text-base md:text-lg hover:bg-white transition-all shadow-lg hover:shadow-xl border-2 border-purple-300 transform hover:scale-105"
          >
            Créer un compte
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 md:mt-16 flex justify-center gap-6 md:gap-12">
          <div>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">3</div>
            <div className="text-gray-600 text-xs md:text-sm mt-1">Jeux par jour</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">9</div>
            <div className="text-gray-600 text-xs md:text-sm mt-1">Numéros tirés</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">∞</div>
            <div className="text-gray-600 text-xs md:text-sm mt-1">Possibilités</div>
          </div>
        </div>
      </div>
    </div>
  );
}
