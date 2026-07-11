import { Suspense } from "react";
import SignInForm from "./SignInForm";

function SignInFallback() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <span className="ios-spinner" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
