import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50/50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-neutral-200/50">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center shadow-xl shadow-[#0B177C]/30">
              <span className="text-white font-bold text-2xl">CT</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
            <CardDescription>Réinitialisez votre mot de passe</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-neutral-500 mb-4">
            Cette fonctionnalité sera disponible prochainement.
          </p>
          <Link to="/auth/login">
            <Button className="w-full">Retour à la connexion</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

