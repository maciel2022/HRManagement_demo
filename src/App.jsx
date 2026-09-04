import { ConfigProvider } from '@/config/ConfigContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SessionProvider } from '@/context/SessionContext';
import AppShell from '@/components/layout/AppShell';
import Login from '@/modules/auth/Login';

function Ruteo() {
  const { autenticado } = useAuth();
  if (!autenticado) return <Login />;
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Ruteo />
      </AuthProvider>
    </ConfigProvider>
  );
}
