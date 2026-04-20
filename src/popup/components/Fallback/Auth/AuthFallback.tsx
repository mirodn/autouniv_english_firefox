import { ERRORS } from "@/constants";
import { Button, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import * as S from "./AuthFallback.style";

function AuthFallback() {
  const queryClient = useQueryClient();

  const clearAuthCache = () => {
    queryClient.clear();
    chrome.storage.local.remove("REACT_QUERY_OFFLINE_CACHE");
  };

  const handleClick = async () => {
    clearAuthCache();
    await chrome.runtime.sendMessage({ type: "AUTOUNIV_AUTH_OPEN" });
  };

  const handleRetry = () => {
    clearAuthCache();
    window.location.reload();
  };

  return (
    <S.AuthFallbackContainer>
      <Typography role="alert" variant="h5" sx={{ color: "#3c3c3ca0" }}>
        {ERRORS.AUTH.message}
      </Typography>
      <Button onClick={handleClick} variant="outlined" size="large" color="secondary">
        새 탭에서 로그인 하기
      </Button>
      <Button onClick={handleRetry} variant="contained" size="large" color="secondary">
        로그인 상태 다시 확인
      </Button>
    </S.AuthFallbackContainer>
  );
}

export default AuthFallback;
