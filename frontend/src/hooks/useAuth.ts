import { useAuthContext } from "../context";

export function useAuth() {
  return useAuthContext();
}

export default useAuth;
