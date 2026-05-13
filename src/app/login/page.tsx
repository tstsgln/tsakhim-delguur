'use client';

import { useActionState, useState } from 'react';
import { login, signup, type AuthState } from '@/app/actions/auth';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState<AuthState, FormData>(
    login,
    undefined,
  );
  const [signupState, signupAction, signupPending] = useActionState<AuthState, FormData>(
    signup,
    undefined,
  );

  const state = isRegister ? signupState : loginState;
  const action = isRegister ? signupAction : loginAction;
  const pending = isRegister ? signupPending : loginPending;
  const errors = state?.errors;

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{isRegister ? 'Бүртгүүлэх' : 'Нэвтрэх'}</h1>
        <p className="text-muted text-sm mt-2">
          {isRegister ? 'Шинэ бүртгэл үүсгэх' : 'Өөрийн бүртгэлээр нэвтрэх'}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <form action={action} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">Нэр</label>
              <input
                name="name"
                type="text"
                placeholder="Таны нэр"
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
              />
              {errors?.name?.[0] && (
                <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Имэйл</label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
            />
            {errors?.email?.[0] && (
              <p className="text-xs text-red-600 mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Нууц үг</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
            />
            {errors?.password?.[0] && (
              <p className="text-xs text-red-600 mt-1">{errors.password[0]}</p>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">Нууц үг давтах</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
              />
              {errors?.confirmPassword?.[0] && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword[0]}</p>
              )}
            </div>
          )}

          {!isRegister && (
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary" />
                Намайг сана
              </label>
              <a href="#" className="text-primary hover:underline">Нууц үг мартсан?</a>
            </div>
          )}

          {state?.message && (
            <p className="text-sm text-red-600 text-center">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {pending ? 'Түр хүлээнэ үү...' : isRegister ? 'Бүртгүүлэх' : 'Нэвтрэх'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-2 text-muted">эсвэл</span>
            </div>
          </div>

          <button className="w-full border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-primary-light/10 transition-colors mb-2">
            📘 Facebook-ээр нэвтрэх
          </button>
          <button className="w-full border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-primary-light/10 transition-colors">
            📧 Google-ээр нэвтрэх
          </button>
        </div>

        <p className="text-center text-sm mt-6 text-muted">
          {isRegister ? 'Бүртгэлтэй юу?' : 'Бүртгэлгүй юу?'}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary hover:underline font-medium"
          >
            {isRegister ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </button>
        </p>
      </div>
    </div>
  );
}
