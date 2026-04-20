import { playListAtom } from "@/atoms";
import { QUERY_KEYS } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";

// background.js가 영상 종료 시 chrome.storage의 "playList"를 직접 업데이트함
// 팝업이 열려있을 때는 onChanged로 감지해서 Jotai atom 동기화
const useChromeMessageHandler = () => {
  const queryClient = useQueryClient();
  const [playList, setPlayList] = useAtom(playListAtom);

  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (!changes.playList) return;
      const newList: typeof playList = changes.playList.newValue ?? [];
      const oldList: typeof playList = changes.playList.oldValue ?? [];

      // 길이가 줄었을 때만 처리 (background.js가 완료된 영상 제거한 경우)
      if (newList.length < oldList.length) {
        queryClient.invalidateQueries([QUERY_KEYS.ASSIGNMENTS, oldList[0]?.course_id ?? null], {
          refetchType: "all",
        });
        setPlayList(newList);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [queryClient, setPlayList]);
};

export default useChromeMessageHandler;
