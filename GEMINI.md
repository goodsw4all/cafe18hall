model: "gemini-1.5-pro"

tools:

- "file_read"
- "file_write"
- "shell"

context:

- "README.md"
- "main.py"
- "routers/" # 라우터 파일들이 있는 폴더를 통째로 지정해도 돼.

temperature: 0.7
