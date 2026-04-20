import axios, { AxiosInstance } from "axios";

let cachedInstance: AxiosInstance | null = null;
let isInitializing = false;
let initPromise: Promise<AxiosInstance> | null = null;

const canvasAxios = axios.create({
  baseURL: "https://canvas.skku.edu/",
  withCredentials: true,
});

const getCookie = async () => {
  const cookie = await chrome.cookies.get({
    name: "xn_api_token",
    url: "https://canvas.skku.edu/",
  });

  return cookie;
};

/**
 * 아이캠퍼스 인증(xn_api_token)을 포함한 Axios 인스턴스를 반환합니다.
 */
export const getAxios = async (forceRefresh = false): Promise<AxiosInstance> => {
  if (cachedInstance && !forceRefresh) return cachedInstance;
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      let cookie = await getCookie();

      // 토큰이 없거나 갱신이 필요한 경우
      if (!cookie || forceRefresh) {
        const { data: courses } = await canvasAxios.get("api/v1/users/self/favorites/courses");

        if (!courses || courses.length === 0) {
          throw new Error("수강 중인 과목 목록을 가져올 수 없습니다. 로그인을 확인해 주세요.");
        }

        const toolIds = [5, 2, 8, 10, 1];
        let success = false;

        /* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue */
        for (const course of courses) {
          if (success) break;
          for (const toolId of toolIds) {
            try {
              const { data: dom } = await canvasAxios.get(
                `courses/${course.id}/external_tools/${toolId}`
              );
              const $html = new DOMParser().parseFromString(dom, "text/html");
              const $form = $html.querySelector("form");
              if (!$form) continue;

              const jsonFormData = Object.fromEntries(new FormData($form));
              await canvasAxios.post("learningx/lti/learnstatus", jsonFormData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
              });

              cookie = await getCookie();
              if (cookie) {
                success = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
      }

      if (!cookie) {
        throw Error("아이캠퍼스 인증 토큰(xn_api_token)을 획득하지 못했습니다.");
      }

      const headers: Record<string, string> = {};
      if (cookie?.value && cookie.value !== "undefined") {
        headers.Authorization = `Bearer ${cookie.value}`;
      } else {
        console.warn("[autouniv] 유효한 xn_api_token을 찾지 못했습니다.");
      }

      cachedInstance = axios.create({
        baseURL: "https://canvas.skku.edu/",
        headers,
        withCredentials: true,
      });

      return cachedInstance;
    } catch (err) {
      console.error("[autouniv] 인증 초기화 오류:", err);
      // 인증 실패해도 기본 인스턴스는 반환하여 앱 전체 크래시 방지
      return canvasAxios;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();

  return initPromise;
};

export default getAxios;
