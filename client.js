window.__ModuleLoader__.load({
	id: "@gaor0605-kq/dsh-workspace-explorer",
	factory(require) {
		const React = require("react");
		const h = React.createElement;
		const { useState, useEffect, useCallback, useRef } = React;

		const PKG = "@gaor0605-kq/dsh-workspace-explorer";
		const KIND = "workspace-explorer";
		const NS = "workspaceExplorer";
		/** Private drag payload type; ordinary file drags ("Files") are left to the attachment owner. */
		const MIME = "application/x-dsh-workspace-ref";
		const INSERT_EVENT = "dsh-workspace-explorer:insert";
		const DRAG_EVENT = "dsh-workspace-explorer:drag";

		const zh = {
			"type.label": "工作区",
			"guide.title": "工作区浏览器",
			"guide.description": "浏览工作区文件，拖到对话里让 DSH 读取",
			hint: "拖动文件/文件夹到对话区域，或点 ⤶ 插入引用",
			loading: "正在读取…",
			empty: "空目录",
			truncated: "条目太多，只显示了一部分。",
			noWorkspace: "这个会话没有工作区目录。",
			reload: "刷新",
			collapseAll: "全部折叠",
			filter: "筛选当前已展开的条目…",
			insert: "插入到对话输入框",
			open: "单击预览，拖动到对话区域引用",
			drop: "松开鼠标，把 {name} 引用到对话中",
			failed: "读取失败：{message}",
			openExplorer: "打开工作区浏览器（右侧栏）",
			openShort: "工作区",
			"side.files": "查看文件",
			"side.chat": "对话",
			"side.filesShort": "文件",
			"side.back": "查看对话",
			"side.filesTip": "在左侧显示当前工作区的文件和文件夹",
			"side.backTip": "切换回对话列表",
			"side.noSession": "先打开一个会话，再查看它的工作区文件。",
			"menu.revealFile": "打开文件所在文件夹",
			"menu.revealDir": "在文件管理器中显示",
			"menu.preview": "预览",
			"menu.insert": "插入到对话输入框",
			"menu.copyPath": "复制完整路径",
			"menu.copyRel": "复制相对路径",
			"menu.noDesktop": "当前 DSH 不在本机桌面上运行，无法打开文件夹",
			"notice.revealFailed": "打开文件夹失败：{message}",
			"notice.copied": "已复制：{text}",
			"notice.copyFailed": "复制失败",
			"git.M": "已修改（相对最近一次提交）",
			"git.U": "未跟踪（新文件，尚未加入 Git）",
			"git.A": "已添加到暂存区（新文件）",
			"git.D": "已删除（最近一次提交里还有）",
			"git.R": "已重命名",
			"git.C": "存在合并冲突",
			"git.I": "已被 .gitignore 忽略",
			"git.dir": "此文件夹内有改动"
		};
		const en = {
			"type.label": "Workspace",
			"guide.title": "Workspace explorer",
			"guide.description": "Browse workspace files and drag them into the chat",
			hint: "Drag files/folders into the conversation, or click ⤶ to insert",
			loading: "Reading…",
			empty: "Empty directory",
			truncated: "Too many entries, showing only some of them.",
			noWorkspace: "This session has no workspace directory.",
			reload: "Reload",
			collapseAll: "Collapse all",
			filter: "Filter expanded entries…",
			insert: "Insert into the composer",
			open: "Click to preview, drag into the conversation to reference",
			drop: "Release to reference {name} in the conversation",
			failed: "Read failed: {message}",
			openExplorer: "Open the workspace explorer (right sidebar)",
			openShort: "Workspace",
			"side.files": "View files",
			"side.chat": "Chats",
			"side.filesShort": "Files",
			"side.back": "View conversations",
			"side.filesTip": "Show the current workspace's files and folders here",
			"side.backTip": "Back to the conversation list",
			"side.noSession": "Open a session first to browse its workspace files.",
			"menu.revealFile": "Open containing folder",
			"menu.revealDir": "Show in file manager",
			"menu.preview": "Preview",
			"menu.insert": "Insert into the composer",
			"menu.copyPath": "Copy full path",
			"menu.copyRel": "Copy relative path",
			"menu.noDesktop": "DSH is not running on this desktop, so folders cannot be opened",
			"notice.revealFailed": "Could not open the folder: {message}",
			"notice.copied": "Copied: {text}",
			"notice.copyFailed": "Copy failed",
			"git.M": "Modified (vs. last commit)",
			"git.U": "Untracked (new, not in Git yet)",
			"git.A": "Added to the index (new file)",
			"git.D": "Deleted (still in the last commit)",
			"git.R": "Renamed",
			"git.C": "Merge conflict",
			"git.I": "Ignored by .gitignore",
			"git.dir": "Contains changes"
		};

		// ---------- styles ----------
		const CSS = `
.wsx-root{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:1.5}
.wsx-header{flex:none;display:flex;align-items:center;gap:4px;height:38px;padding:0 6px 0 14px;border-bottom:.5px solid var(--dsw-alias-border-l3);box-sizing:border-box}
.wsx-rootname{flex:auto;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wsx-tool{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.wsx-tool:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.wsx-filter{flex:none;margin:8px 10px 0;padding:5px 9px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);background:transparent;color:inherit;font:inherit;outline:none}
.wsx-filter:focus{border-color:var(--dsw-alias-label-tertiary)}
.wsx-hint{flex:none;margin:6px 14px 0;color:var(--dsw-alias-label-tertiary);font-size:12px}
.wsx-body{flex:auto;min-height:0;overflow:auto;padding:6px 4px 10px 6px}
.wsx-level{list-style:none;margin:0;padding:0}
.wsx-level .wsx-level{padding-left:14px}
.wsx-row{position:relative;display:flex;align-items:center;gap:6px;width:100%;min-width:0;padding:3px 6px;border-radius:var(--dsw-radius-md,8px);cursor:pointer;user-select:none;box-sizing:border-box}
.wsx-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.wsx-row:active{cursor:grabbing}
.wsx-row.wsx-dragging{opacity:.5}
.wsx-caret{flex:none;width:12px;color:var(--dsw-alias-label-tertiary);transition:transform .12s}
.wsx-caret.wsx-open{transform:rotate(90deg)}
.wsx-icon{flex:none;color:var(--dsw-alias-label-tertiary)}
.wsx-name{flex:auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wsx-ins{flex:none;display:none;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.wsx-row:hover .wsx-ins,.wsx-ins:focus-visible{display:inline-flex}
.wsx-ins:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.wsx-note{padding:3px 8px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.wsx-open-btn{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.wsx-open-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.wsx-dropzone{margin:0 0 8px;padding:10px 14px;border:1.5px dashed var(--dsw-alias-label-tertiary);border-radius:var(--dsw-radius-lg,12px);color:var(--dsw-alias-label-secondary);text-align:center;font-size:13px;background:var(--dsw-alias-interactive-bg-hover)}
.wsx-side{flex:none;display:flex;flex-direction:column;min-height:0;margin:0 0 4px}
[data-wsx-mode="files"] .wsx-side{flex:1 1 auto}
[data-wsx-mode="files"] [data-wsx-hide]{display:none!important}
[data-wsx-mode="files"] .wsx-side ~ *{display:none!important}
.wsx-side-fallback{max-height:50vh}
.wsx-side:empty{display:none}
.wsx-seg-host{display:flex;align-items:center;flex:0 1 auto;margin:0 auto 0 6px;min-width:0;overflow:hidden}
.wsx-seg-row{padding:2px 8px 4px}
.wsx-seg-host ~ *{flex-shrink:0}
.wsx-seg{display:inline-flex;align-items:center;gap:1px;padding:2px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-default,rgba(127,127,127,.18));min-width:0}
.wsx-seg-btn{display:inline-flex;align-items:center;justify-content:center;gap:3px;height:20px;min-width:22px;padding:0 5px;border:0;border-radius:999px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;line-height:1;white-space:nowrap;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s}
.wsx-seg-btn > span{display:none}
.wsx-seg-btn.wsx-seg-on > span{display:inline}
.wsx-seg-btn.wsx-seg-on{padding:0 7px 0 6px}
.wsx-seg-btn:hover{color:var(--dsw-alias-label-primary)}
.wsx-seg-btn .wsx-icon,.wsx-seg-btn svg{width:13px;height:13px;flex:none}
.wsx-seg-btn.wsx-seg-on{background:var(--dsw-alias-bg-primary,var(--dsw-alias-bg-elevated,#fff));color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:0 1px 2px rgba(0,0,0,.12)}
.wsx-seg-btn:focus-visible{outline:2px solid var(--dsw-alias-accent,#4c8bf5);outline-offset:1px}
.wsx-switch{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 8px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:14px;text-align:left;cursor:pointer;box-sizing:border-box}
.wsx-switch:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.wsx-switch.wsx-switch-on{color:var(--dsw-alias-label-primary)}
.wsx-side-tree{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;margin-top:4px}
.wsx-compact .wsx-header{height:32px;padding:0 2px 0 8px;border-bottom:0}
.wsx-compact .wsx-filter{margin:4px 2px 0}
.wsx-compact .wsx-hint{margin:6px 8px 0}
.wsx-compact .wsx-body{padding:4px 0 10px}
.wsx-row.wsx-menu-target{background:var(--dsw-alias-interactive-bg-hover)}
.wsx-menu{position:fixed;z-index:10000;min-width:188px;max-width:320px;padding:4px;border-radius:10px;background:var(--dsw-alias-bg-elevated,var(--dsw-alias-bg-primary,#fff));color:var(--dsw-alias-label-primary);box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px var(--dsw-alias-border-default,rgba(127,127,127,.18));font-size:13px;box-sizing:border-box}
.wsx-menu-item{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;text-align:left;white-space:nowrap;cursor:pointer}
.wsx-menu-item:hover:not(:disabled),.wsx-menu-item:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}
.wsx-menu-item:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}
.wsx-menu-item svg{flex:none;width:14px;height:14px;color:var(--dsw-alias-label-secondary)}
.wsx-menu-sep{height:1px;margin:4px 6px;background:var(--dsw-alias-border-default,rgba(127,127,127,.18))}
.wsx-notice{margin:4px 8px 0;padding:4px 8px;border-radius:6px;font-size:12px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsx-badge{flex:none;min-width:14px;margin-left:2px;text-align:center;font-size:11px;font-weight:600;font-family:var(--dsh-font-mono,ui-monospace,Consolas,monospace);color:var(--wsx-git)}
.wsx-row:hover .wsx-badge{display:none}
.wsx-git-M{--wsx-git:#c98a1b}
.wsx-git-U,.wsx-git-A,.wsx-git-R{--wsx-git:#3f9e5c}
.wsx-git-D{--wsx-git:#d0533f}
.wsx-git-C{--wsx-git:#d6454f}
.wsx-row[class*="wsx-git-"] > .wsx-name{color:var(--wsx-git)}
.wsx-row.wsx-deleted > .wsx-name{text-decoration:line-through}
.wsx-row.wsx-deleted{cursor:default}
.wsx-row.wsx-ignored > .wsx-name,.wsx-row.wsx-ignored > .wsx-icon{opacity:.5}
`;
		function ensureStyle() {
			if (typeof document === "undefined") return () => {};
			let tag = document.querySelector(`style[data-plugin-css="${PKG}"]`);
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = PKG;
				tag.dataset.pluginCss = PKG;
				tag.textContent = CSS;
				document.head.appendChild(tag);
			}
			return () => tag.remove();
		}

		// ---------- icons ----------
		const svg = (size, children, extra) => h("svg", Object.assign({ width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, extra), children);
		const FolderIcon = ({ open }) => svg(15, open
			? [h("path", { key: 1, d: "M1.8 4.2c0-.7.5-1.2 1.2-1.2h3l1.4 1.5h5.1c.7 0 1.2.5 1.2 1.2v.8" }), h("path", { key: 2, d: "M1.8 12.8l1.6-5.6c.1-.4.5-.7.9-.7h9.6c.6 0 1 .6.9 1.1l-1.4 4.6c-.1.4-.5.6-.9.6H2.8c-.6 0-1-.4-1-1z" })]
			: [h("path", { key: 1, d: "M1.8 4.2c0-.7.5-1.2 1.2-1.2h3l1.4 1.5h5.6c.7 0 1.2.5 1.2 1.2v6.1c0 .7-.5 1.2-1.2 1.2H3c-.7 0-1.2-.5-1.2-1.2z" })], { className: "wsx-icon" });
		const FileIcon = () => svg(15, [h("path", { key: 1, d: "M4 1.8h5l3.2 3.2v8.2c0 .6-.5 1-1 1H4c-.6 0-1-.4-1-1V2.8c0-.6.4-1 1-1z" }), h("path", { key: 2, d: "M9 1.8V5h3.2" })], { className: "wsx-icon" });
		const CaretIcon = ({ open }) => svg(12, h("path", { d: "M6 4l4 4-4 4" }), { className: "wsx-caret" + (open ? " wsx-open" : "") });
		const ReloadIcon = () => svg(15, [h("path", { key: 1, d: "M13.2 8a5.2 5.2 0 1 1-1.5-3.7" }), h("path", { key: 2, d: "M12.2 1.8v2.8H9.4" })]);
		const CollapseIcon = () => svg(15, [h("path", { key: 1, d: "M4.5 6.5L8 3l3.5 3.5" }), h("path", { key: 2, d: "M4.5 13L8 9.5l3.5 3.5" })]);
		const InsertIcon = () => svg(14, [h("path", { key: 1, d: "M13 3v4.5c0 .8-.7 1.5-1.5 1.5H3.5" }), h("path", { key: 2, d: "M6 6L3 9l3 3" })]);
		const RevealIcon = () => svg(14, [h("path", { key: 1, d: "M1.8 4.2c0-.7.5-1.2 1.2-1.2h3l1.4 1.5h5.6c.7 0 1.2.5 1.2 1.2v6.1c0 .7-.5 1.2-1.2 1.2H3c-.7 0-1.2-.5-1.2-1.2z" }), h("path", { key: 2, d: "M8 7v4M6.3 8.6L8 7l1.7 1.6" })]);
		const EyeIcon = () => svg(14, [h("path", { key: 1, d: "M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z" }), h("circle", { key: 2, cx: 8, cy: 8, r: 1.8 })]);
		const CopyIcon = () => svg(14, [h("rect", { key: 1, x: 5, y: 5, width: 8.5, height: 8.5, rx: 1.5 }), h("path", { key: 2, d: "M10.5 5V3.5c0-.8-.7-1.5-1.5-1.5H3.5C2.7 2 2 2.7 2 3.5V9c0 .8.7 1.5 1.5 1.5H5" })]);
		const ChatIcon = () => svg(15, [h("path", { key: 1, d: "M2.5 4c0-.8.7-1.5 1.5-1.5h8c.8 0 1.5.7 1.5 1.5v5.5c0 .8-.7 1.5-1.5 1.5H7l-3 2.5V11H4c-.8 0-1.5-.7-1.5-1.5z" })], { className: "wsx-icon" });
		const GuideIcon = ({ size = 22, className }) => h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", className, "aria-hidden": true }, [
			h("path", { key: 1, d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
			h("path", { key: 2, d: "M12 11v5M9.5 13.5L12 16l2.5-2.5" })
		]);

		// ---------- path helpers ----------
		const byName = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
		const order = (entries) => [...entries].sort((a, b) => {
			const g = Number(b.type === "directory") - Number(a.type === "directory");
			return g !== 0 ? g : byName.compare(a.name, b.name);
		});
		const trimRoot = (cwd) => cwd.replace(/[\\/]+$/, "");
		const absolute = (cwd, rel) => rel === "" ? cwd : `${trimRoot(cwd)}/${rel}`;
		/** Host-native absolute path: keeps the separator style the workspace root already uses (`F:\dsh_work\a\b.md`). */
		const hostPath = (cwd, rel) => {
			if (rel === "") return cwd;
			const sep = cwd.includes("\\") && !cwd.includes("/") ? "\\" : "/";
			return `${trimRoot(cwd)}${sep}${rel.split("/").join(sep)}`;
		};
		const join = (rel, name) => rel === "" ? name : `${rel}/${name}`;
		const baseName = (rel) => rel.split("/").pop() || rel;
		const enc = (s) => encodeURIComponent(s).replace(/%3A/gi, ":");
		const fileAddress = (sessionId, rel) => `dsh-resource://file/session/${enc(sessionId)}/${rel.split("/").map(enc).join("/")}`;
		/** `@path` / `@"path with spaces"` mention as the composer grammar spells it; folders keep a trailing slash. */
		function mention(rel, isDir) {
			const p = isDir ? `${rel}/` : rel;
			return /[\s"]/.test(p) ? `@"${p.replace(/"/g, "")}"` : `@${p}`;
		}
		const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? String(vars[k]) : ""));

		// ---------- git decorations (VS Code style: working tree vs. last commit) ----------
		const GIT_ROUTE = "dsh-workspace-explorer/git-status";
		const GIT_POLL_MS = 5000;
		/** Same-origin URL anchored on the directory the UI is served from (works behind path prefixes and on Desktop). */
		const apiUrl = (rel) => {
			try { return new URL(rel, document.baseURI).pathname; } catch { return `/${rel}`; }
		};
		/** Folder rollup: the most important status found anywhere below wins. */
		const GIT_RANK = { C: 6, M: 5, D: 4, A: 3, R: 3, U: 2 };
		const GIT_LETTER = { C: "!", M: "M", D: "D", A: "A", R: "R", U: "U" };
		function deriveGit(json, raw) {
			if (!json || json.repo !== true || json.error) return null;
			const files = json.files || {};
			const dirs = {};
			const deleted = {};
			for (const path of Object.keys(files)) {
				const code = files[path];
				const parts = path.replace(/\/+$/, "").split("/");
				for (let k = 1; k < parts.length; k++) {
					const d = parts.slice(0, k).join("/");
					if ((GIT_RANK[code] || 0) > (GIT_RANK[dirs[d]] || 0)) dirs[d] = code;
				}
				if (code === "D") {
					// Register the deleted file, and every vanished folder on its way, as phantom children.
					for (let k = 0; k < parts.length; k++) {
						const parent = parts.slice(0, k).join("/");
						const name = parts[k];
						const isDir = k < parts.length - 1;
						const bucket = deleted[parent] || (deleted[parent] = new Map());
						if (!bucket.has(name) || isDir) bucket.set(name, isDir);
					}
				}
			}
			const ignored = new Set((json.ignored || []).map((p) => p.replace(/\/+$/, "")));
			return {
				raw,
				truncated: json.truncated === true,
				fileCode: (rel) => files[rel],
				dirCode: (rel) => dirs[rel],
				isIgnored: (rel) => {
					if (ignored.size === 0) return false;
					let p = rel;
					for (;;) {
						if (ignored.has(p)) return true;
						const i = p.lastIndexOf("/");
						if (i < 0) return false;
						p = p.slice(0, i);
					}
				},
				/** Deleted children of `rel` that no longer exist on disk: Map<name, isDir>. */
				deletedIn: (rel) => deleted[rel],
				hasDeletedUnder: (rel) => deleted[rel] !== undefined
			};
		}
		/** Poll the host route while the tree is mounted and the page visible; also on focus and on demand. */
		function useGitStatus(sessionId, enabled) {
			const [git, setGit] = useState(null);
			const [nonce, setNonce] = useState(0);
			useEffect(() => {
				if (!enabled || !sessionId || typeof fetch !== "function") {
					setGit(null);
					return undefined;
				}
				let stopped = false;
				let inflight = false;
				let ac = null;
				const run = () => {
					if (stopped || inflight) return;
					if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
					inflight = true;
					ac = new AbortController();
					fetch(`${apiUrl(GIT_ROUTE)}?session=${encodeURIComponent(sessionId)}`, { cache: "no-store", credentials: "same-origin", signal: ac.signal })
						.then((r) => (r.ok ? r.text() : null))
						.then((text) => {
							if (stopped || text === null) return;
							setGit((prev) => {
								if (prev !== null && prev.raw === text) return prev;
								let json = null;
								try { json = JSON.parse(text); } catch { json = null; }
								return deriveGit(json, text);
							});
						})
						.catch(() => {})
						.finally(() => { inflight = false; });
				};
				run();
				const timer = setInterval(run, GIT_POLL_MS);
				const wake = () => run();
				window.addEventListener("focus", wake);
				document.addEventListener("visibilitychange", wake);
				return () => {
					stopped = true;
					clearInterval(timer);
					ac?.abort();
					window.removeEventListener("focus", wake);
					document.removeEventListener("visibilitychange", wake);
				};
			}, [sessionId, enabled, nonce]);
			const refresh = useCallback(() => setNonce((n) => n + 1), []);
			return { git, refresh };
		}

		// ---------- explorer body (right sidebar tab) ----------
		function makeBody(remote, t, ReactDOM, desktop) {
			const list = (sessionId, path, signal) => remote.workspaceFiles.list(sessionId, path, signal);

			/** Right-click menu for one tree row, portalled to <body> so sidebar overflow never clips it. */
			function RowMenu({ menu, items, onClose }) {
				const ref = useRef(null);
				const [pos, setPos] = useState({ left: menu.x, top: menu.y });
				React.useLayoutEffect(() => {
					const el = ref.current;
					if (el === null) return;
					const r = el.getBoundingClientRect();
					const left = Math.max(4, Math.min(menu.x, window.innerWidth - r.width - 4));
					const top = menu.y + r.height > window.innerHeight - 4 ? Math.max(4, menu.y - r.height) : menu.y;
					setPos({ left, top });
					el.querySelector("button:not(:disabled)")?.focus();
				}, [menu.x, menu.y]);
				useEffect(() => {
					const away = (e) => { if (ref.current !== null && !ref.current.contains(e.target)) onClose(); };
					const key = (e) => { if (e.key === "Escape") onClose(); };
					const close = () => onClose();
					window.addEventListener("pointerdown", away, true);
					window.addEventListener("contextmenu", away, true);
					window.addEventListener("keydown", key, true);
					window.addEventListener("blur", close);
					window.addEventListener("resize", close);
					window.addEventListener("scroll", close, true);
					return () => {
						window.removeEventListener("pointerdown", away, true);
						window.removeEventListener("contextmenu", away, true);
						window.removeEventListener("keydown", key, true);
						window.removeEventListener("blur", close);
						window.removeEventListener("resize", close);
						window.removeEventListener("scroll", close, true);
					};
				}, [onClose]);
				const children = items.map((item, i) => item === "sep"
					? h("div", { key: `s${i}`, className: "wsx-menu-sep", role: "separator" })
					: h("button", {
						key: item.id,
						type: "button",
						role: "menuitem",
						className: "wsx-menu-item",
						disabled: item.disabled === true,
						title: item.title,
						onClick: () => { onClose(); item.run(); }
					}, [h(item.icon, { key: "i" }), h("span", { key: "l" }, item.label)]));
				const node = h("div", { ref, className: "wsx-menu", role: "menu", style: pos, onContextMenu: (e) => e.preventDefault() }, children);
				return ReactDOM && ReactDOM.createPortal ? ReactDOM.createPortal(node, document.body) : node;
			}

			function Row({ node, depth, ctxv }) {
				const { rel, entry } = node;
				const isDir = entry.type === "directory";
				const open = isDir && ctxv.expanded.has(rel);
				const [dragging, setDragging] = useState(false);
				const onDragStart = (e) => {
					const text = mention(rel, isDir);
					const payload = JSON.stringify({ sessionId: ctxv.sessionId, rel, isDir, text, name: entry.name });
					e.dataTransfer.effectAllowed = "copy";
					e.dataTransfer.setData(MIME, payload);
					e.dataTransfer.setData("text/plain", text);
					setDragging(true);
					window.dispatchEvent(new CustomEvent(DRAG_EVENT, { detail: { active: true, sessionId: ctxv.sessionId, name: entry.name } }));
				};
				const onDragEnd = () => {
					setDragging(false);
					window.dispatchEvent(new CustomEvent(DRAG_EVENT, { detail: { active: false } }));
				};
				const onClick = () => {
					if (isDir) ctxv.toggle(rel);
					else if (entry.type === "file") ctxv.open(rel);
				};
				const insert = (e) => {
					e.stopPropagation();
					window.dispatchEvent(new CustomEvent(INSERT_EVENT, { detail: { sessionId: ctxv.sessionId, text: mention(rel, isDir) } }));
				};
				const onContextMenu = (e) => {
					e.preventDefault();
					e.stopPropagation();
					ctxv.openMenu({ x: e.clientX, y: e.clientY, rel, isDir, isFile: entry.type === "file" });
				};
				const targeted = ctxv.menuRel === rel;
				const deleted = entry.deleted === true;
				const g = ctxv.git;
				const code = deleted ? "D" : g === null ? undefined : isDir ? g.dirCode(rel) : g.fileCode(rel);
				const ignored = !deleted && code === undefined && g !== null && g.isIgnored(rel);
				const gitText = code !== undefined ? t(isDir ? "git.dir" : `git.${code}`) : ignored ? t("git.I") : null;
				const gitClass = (code !== undefined ? ` wsx-git-${code}` : "") + (ignored ? " wsx-ignored" : "") + (deleted ? " wsx-deleted" : "");
				return h("li", { "data-wsx-path": rel, "data-wsx-type": entry.type }, [
					h("div", {
						key: "row",
						className: "wsx-row" + (dragging ? " wsx-dragging" : "") + (targeted ? " wsx-menu-target" : "") + gitClass,
						role: "treeitem",
						"aria-expanded": isDir ? open : undefined,
						"aria-haspopup": deleted ? undefined : "menu",
						tabIndex: 0,
						draggable: !deleted,
						title: `${rel}${gitText !== null ? `\n${gitText}` : ""}${deleted ? "" : `\n${t("open")}`}`,
						onDragStart,
						onDragEnd,
						onClick: deleted && !isDir ? undefined : onClick,
						onContextMenu: deleted ? (e) => e.preventDefault() : onContextMenu,
						onKeyDown: (e) => {
							if (e.key === "Enter") { if (!deleted || isDir) onClick(); }
							else if (!deleted && (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10"))) {
								e.preventDefault();
								const r = e.currentTarget.getBoundingClientRect();
								ctxv.openMenu({ x: r.left + 24, y: r.bottom, rel, isDir, isFile: entry.type === "file" });
							}
						}
					}, [
						isDir ? h(CaretIcon, { key: "c", open }) : h("span", { key: "c", style: { width: 12, flex: "none" } }),
						isDir ? h(FolderIcon, { key: "i", open }) : h(FileIcon, { key: "i" }),
						h("span", { key: "n", className: "wsx-name" }, entry.name),
						code !== undefined
							? h("span", { key: "g", className: "wsx-badge", "aria-label": gitText }, isDir ? "\u2022" : GIT_LETTER[code])
							: null,
						deleted ? null : h("button", { key: "b", type: "button", className: "wsx-ins", title: t("insert"), "aria-label": t("insert"), onClick: insert }, h(InsertIcon))
					]),
					open ? h("ul", { key: "kids", className: "wsx-level", role: "group" }, h(Level, { rel, depth: depth + 1, ctxv })) : null
				]);
			}

			function Level({ rel, depth, ctxv }) {
				let level = ctxv.levels[rel];
				const phantoms = ctxv.git !== null ? ctxv.git.deletedIn(rel) : undefined;
				// A folder that only exists in the last commit (everything inside deleted) has no listing to wait for.
				if (phantoms !== undefined && (level === undefined || level.kind === "failed") && ctxv.isPhantom(rel)) level = { kind: "ready", entries: [], truncated: false };
				if (level === undefined || level.kind === "loading") return h("li", { className: "wsx-note" }, t("loading"));
				if (level.kind === "failed") return h("li", { className: "wsx-note" }, fill(t("failed"), { message: level.message }));
				const q = ctxv.filter.trim().toLowerCase();
				let all = level.entries;
				if (phantoms !== undefined) {
					const present = new Set(all.map((e) => e.name));
					const extra = [];
					for (const [name, isDir] of phantoms) if (!present.has(name)) extra.push({ name, type: isDir ? "directory" : "file", deleted: true });
					if (extra.length > 0) all = all.concat(extra);
				}
				let entries = order(all);
				if (q !== "") entries = entries.filter((e) => e.type === "directory" && ctxv.expanded.has(join(rel, e.name)) || e.name.toLowerCase().includes(q));
				const out = entries.map((entry) => h(Row, { key: entry.name, node: { rel: join(rel, entry.name), entry }, depth, ctxv }));
				if (entries.length === 0) out.push(h("li", { key: "empty", className: "wsx-note" }, t("empty")));
				if (level.truncated) out.push(h("li", { key: "trunc", className: "wsx-note" }, t("truncated")));
				return h(React.Fragment, null, out);
			}

			function ExplorerBody({ useTabInfo, sessionId, useSessions }) {
				const { tab } = useTabInfo();
				const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
				const open = useCallback((rel) => tab.actions.openResource(fileAddress(sessionId, rel)), [tab.actions, sessionId]);
				const bindRefresh = useCallback((refresh) => tab.actions.bindCommands?.({ refresh }), [tab.actions]);
				return h(ExplorerTree, { sessionId, cwd, signal: tab.signal, openFile: open, bindRefresh });
			}

			function ExplorerTree({ sessionId, cwd, signal: outerSignal, openFile, bindRefresh, compact }) {
				const { git, refresh: refreshGit } = useGitStatus(sessionId, Boolean(cwd));
				const [levels, setLevels] = useState({});
				const [expanded, setExpanded] = useState(() => new Set([""]));
				const [filter, setFilter] = useState("");
				const [menu, setMenu] = useState(null);
				const [canReveal, setCanReveal] = useState(null);
				const [notice, setNotice] = useState(null);
				const noticeTimer = useRef(0);
				const controllers = useRef(new Map());
				const closeMenu = useCallback(() => setMenu(null), []);
				const say = useCallback((text) => {
					setNotice(text);
					clearTimeout(noticeTimer.current);
					noticeTimer.current = setTimeout(() => setNotice(null), 3500);
				}, []);
				useEffect(() => () => clearTimeout(noticeTimer.current), []);

				const load = useCallback((rel) => {
					if (!cwd) return;
					controllers.current.get(rel)?.abort();
					const ac = new AbortController();
					controllers.current.set(rel, ac);
					const signal = outerSignal ? AbortSignal.any([ac.signal, outerSignal]) : ac.signal;
					setLevels((prev) => prev[rel]?.kind === "ready" ? prev : Object.assign({}, prev, { [rel]: { kind: "loading" } }));
					Promise.resolve(list(sessionId, absolute(cwd, rel), signal)).then((result) => {
						if (signal.aborted) return;
						setLevels((prev) => Object.assign({}, prev, {
							[rel]: result.ok
								? { kind: "ready", entries: result.value.entries, truncated: result.value.truncated }
								: { kind: "failed", message: result.error?.message ?? String(result.error) }
						}));
					}, (error) => {
						if (signal.aborted) return;
						setLevels((prev) => Object.assign({}, prev, { [rel]: { kind: "failed", message: error?.message ?? String(error) } }));
					});
				}, [cwd, sessionId, outerSignal]);

				useEffect(() => {
					setLevels({});
					setExpanded(new Set([""]));
					if (cwd) load("");
				}, [cwd, load]);
				useEffect(() => () => { for (const ac of controllers.current.values()) ac.abort(); }, []);

				const reload = useCallback(() => {
					for (const rel of expanded) load(rel);
					refreshGit();
				}, [expanded, load, refreshGit]);
				useEffect(() => (bindRefresh ? bindRefresh(reload) : undefined), [bindRefresh, reload]);

				if (!cwd) return h("div", { className: "wsx-root" }, h("div", { className: "wsx-note", style: { padding: 14 } }, t("noWorkspace")));

				const ctxv = {
					sessionId,
					levels,
					expanded,
					filter,
					git,
					/** True when `rel` is a folder the parent listing no longer has (only known from the last commit). */
					isPhantom: (rel) => {
						const i = rel.lastIndexOf("/");
						const parent = i < 0 ? "" : rel.slice(0, i);
						const name = i < 0 ? rel : rel.slice(i + 1);
						const lv = levels[parent];
						if (lv !== undefined && lv.kind === "ready") return !lv.entries.some((e) => e.name === name);
						return parent !== "" && ctxv.isPhantom(parent);
					},
					toggle: (rel) => {
						const next = new Set(expanded);
						if (next.has(rel)) {
							for (const p of expanded) if (p === rel || p.startsWith(`${rel}/`)) next.delete(p);
						} else {
							next.add(rel);
							if ((levels[rel] === undefined || levels[rel].kind === "failed") && !ctxv.isPhantom(rel)) load(rel);
						}
						setExpanded(next);
					},
					open: (rel) => {
						try { openFile(rel); } catch (error) { console.warn("[workspace-explorer] open failed", error); }
					},
					menuRel: menu === null ? null : menu.rel,
					openMenu: (next) => {
						setMenu(next);
						if (canReveal === null) desktop.available().then(setCanReveal);
					}
				};
				const copy = (text) => {
					const done = () => say(fill(t("notice.copied"), { text }));
					const fail = () => say(t("notice.copyFailed"));
					try {
						navigator.clipboard.writeText(text).then(done, fail);
					} catch {
						fail();
					}
				};
				const menuItems = (m) => {
					const abs = hostPath(cwd, m.rel);
					const items = [{
						id: "reveal",
						icon: RevealIcon,
						label: t(m.isDir ? "menu.revealDir" : "menu.revealFile"),
						disabled: canReveal === false,
						title: canReveal === false ? t("menu.noDesktop") : abs,
						run: () => {
							desktop.reveal(abs).then((failure) => {
								if (failure !== null) say(fill(t("notice.revealFailed"), { message: failure }));
							});
						}
					}];
					if (m.isFile) items.push({ id: "preview", icon: EyeIcon, label: t("menu.preview"), run: () => ctxv.open(m.rel) });
					items.push({
						id: "insert",
						icon: InsertIcon,
						label: t("menu.insert"),
						run: () => window.dispatchEvent(new CustomEvent(INSERT_EVENT, { detail: { sessionId, text: mention(m.rel, m.isDir) } }))
					});
					items.push("sep");
					items.push({ id: "copy-abs", icon: CopyIcon, label: t("menu.copyPath"), title: abs, run: () => copy(abs) });
					items.push({ id: "copy-rel", icon: CopyIcon, label: t("menu.copyRel"), title: m.rel, run: () => copy(m.rel) });
					return items;
				};
				const rootName = trimRoot(cwd).split(/[\\/]/).pop() || cwd;
				return h("div", { className: "wsx-root" + (compact ? " wsx-compact" : ""), "data-wsx-tree": true }, [
					h("div", { key: "hd", className: "wsx-header" }, [
						h("span", { key: "n", className: "wsx-rootname", title: cwd }, rootName),
						h("button", { key: "c", type: "button", className: "wsx-tool", title: t("collapseAll"), "aria-label": t("collapseAll"), onClick: () => setExpanded(new Set([""])) }, h(CollapseIcon)),
						h("button", { key: "r", type: "button", className: "wsx-tool", title: t("reload"), "aria-label": t("reload"), onClick: reload }, h(ReloadIcon))
					]),
					h("input", { key: "f", className: "wsx-filter", type: "search", placeholder: t("filter"), value: filter, onChange: (e) => setFilter(e.target.value) }),
					h("div", { key: "hint", className: "wsx-hint" }, t("hint")),
					notice !== null ? h("div", { key: "notice", className: "wsx-notice", role: "status", title: notice }, notice) : null,
					h("div", { key: "body", className: "wsx-body" }, h("ul", { className: "wsx-level", role: "tree" }, h(Level, { rel: "", depth: 0, ctxv }))),
					menu !== null ? h(RowMenu, { key: "menu", menu, items: menuItems(menu), onClose: closeMenu }) : null
				]);
			}

			return { ExplorerBody, ExplorerTree };
		}

		// ---------- left sidebar: "查看文件" / "查看对话" under the workspace header ----------
		/** Class names emitted by ui-sidebar / ui-workspace CSS modules (stable per build), plus fuzzy fallbacks. */
		const pick = (root, exact, fuzzy) => root.querySelector(exact) ?? root.querySelector(fuzzy);
		function locate(anchor) {
			const sidebar = anchor.closest(".wtg9ga_root") ?? anchor.closest('[class*="_root"]');
			if (sidebar === null) return null;
			const region = pick(sidebar, ".wtg9ga_regionArea", '[class*="_regionArea"]');
			if (region === null) return null;
			const browser = pick(region, ".GAkraW_root", ':scope > [class*="_root"]');
			if (browser === null) return null;
			const header = browser.querySelector(':scope > .GAkraW_sectionHeader') ?? browser.querySelector(':scope > [class*="_sectionHeader"]') ?? browser.firstElementChild;
			return { sidebar, region, browser, header };
		}
		const selectMain = (s) => {
			const byId = s?.byId ?? {};
			for (const id of Object.keys(byId)) {
				const x = byId[id];
				if ((x?.retainedBy?.mainView ?? 0) > 0) return `${x.id ?? id}\n${x.cwd ?? ""}`;
			}
			return "";
		};
		const MODE_KEY = "dsh-workspace-explorer.sidebar-mode";
		/** In files mode hide everything rendered after the switch, at every level up to the region (session list, search, etc.). */
		function clearHide(region) {
			for (const n of region.querySelectorAll("[data-wsx-hide]")) n.removeAttribute("data-wsx-hide");
		}
		function applyHide(el, region) {
			const files = region.dataset.wsxMode === "files";
			const keep = new Set();
			if (files) {
				for (let node = el; node && node !== region; node = node.parentElement) {
					keep.add(node);
					for (let sib = node.nextElementSibling; sib; sib = sib.nextElementSibling) {
						if (!sib.hasAttribute("data-wsx-hide")) sib.setAttribute("data-wsx-hide", "");
						keep.add(sib);
					}
				}
			}
			for (const n of region.querySelectorAll("[data-wsx-hide]")) {
				if (!files || !keep.has(n) || n === el || n.contains(el)) n.removeAttribute("data-wsx-hide");
			}
		}

		function makeSidebarFiles(ReactDOM, Tree, t, getSidebarRight) {
			return function SidebarFiles({ wide, useSessions }) {
				const anchor = useRef(null);
				const regionRef = useRef(null);
				const [host, setHost] = useState(null);
				const [mode, setModeState] = useState(() => {
					try { return localStorage.getItem(MODE_KEY) === "files" ? "files" : "chat"; } catch { return "chat"; }
				});
				const setMode = (m) => {
					setModeState(m);
					try { localStorage.setItem(MODE_KEY, m); } catch {}
				};
				const main = typeof useSessions === "function" ? useSessions(selectMain) : "";
				const [sessionId, cwd] = main === "" ? [undefined, undefined] : main.split("\n");
				const modeRef = useRef(mode);
				modeRef.current = mode;

				useEffect(() => {
					if (wide === false || anchor.current === null) { setHost(null); return; }
					const el = document.createElement("div");
					el.className = "wsx-side";
					const seg = document.createElement("div");
					seg.className = "wsx-seg-host";
					let observed = null;
					const place = () => {
						const found = anchor.current && locate(anchor.current);
						if (!found || !found.header) return;
						regionRef.current = found.region;
						if (found.region.dataset.wsxMode !== modeRef.current) found.region.dataset.wsxMode = modeRef.current;
						if (el.parentNode !== found.browser || el.previousElementSibling !== found.header) {
							found.browser.insertBefore(el, found.header.nextSibling);
						}
						let title = found.header.firstElementChild;
						if (title === seg) title = seg.nextElementSibling;
						if (title && (seg.parentNode !== found.header || seg.previousElementSibling !== title)) {
							found.header.insertBefore(seg, title.nextSibling);
						}
						applyHide(el, found.region);
						if (observed !== found.sidebar) {
							mo.disconnect();
							mo.observe(found.sidebar, { childList: true, subtree: true });
							observed = found.sidebar;
						}
					};
					const mo = new MutationObserver(() => place());
					place();
					if (el.parentNode === null) console.warn("[workspace-explorer] workspace header not found; showing the switch in the sidebar footer instead");
					setHost(el.parentNode === null ? null : { el, seg: seg.parentNode === null ? null : seg });
					return () => {
						mo.disconnect();
						if (regionRef.current) clearHide(regionRef.current);
						el.remove();
						seg.remove();
						if (regionRef.current) delete regionRef.current.dataset.wsxMode;
					};
				}, [wide]);

				useEffect(() => {
					if (regionRef.current) regionRef.current.dataset.wsxMode = mode;
					if (host && regionRef.current) applyHide(host.el, regionRef.current);
				}, [mode, host]);

				const ac = useRef(null);
				if (ac.current === null) ac.current = new AbortController();
				useEffect(() => () => ac.current.abort(), []);
				const openFile = useCallback((rel) => {
					const sr = getSidebarRight();
					if (sr && sessionId) sr.openResource(fileAddress(sessionId, rel));
				}, [sessionId]);

				const files = mode === "files";
				const segBtn = (m, label, tip, icon) => h("button", {
					key: m,
					type: "button",
					role: "tab",
					"aria-selected": mode === m,
					className: "wsx-seg-btn" + (mode === m ? " wsx-seg-on" : ""),
					title: tip,
					onClick: () => { if (mode !== m) setMode(m); }
				}, [icon, h("span", { key: "t" }, label)]);
				const switcher = h("div", { className: "wsx-seg", role: "tablist", onClick: (e) => e.stopPropagation() }, [
					segBtn("chat", t("side.chat"), t("side.backTip"), h(ChatIcon, { key: "i" })),
					segBtn("files", t("side.filesShort"), t("side.filesTip"), h(FolderIcon, { key: "i", open: files }))
				]);
				const tree = files ? h("div", { key: "tree", className: "wsx-side-tree" },
					sessionId === undefined
						? h("div", { className: "wsx-note" }, t("side.noSession"))
						: h(Tree, { key: sessionId, sessionId, cwd, signal: ac.current.signal, openFile, compact: true })
				) : null;

				let body;
				if (wide === false) body = null;
				else if (host === null) body = h("div", { key: "fallback", className: "wsx-side wsx-side-fallback" }, [h(React.Fragment, { key: "s" }, switcher), tree]);
				else if (host.seg === null) body = ReactDOM.createPortal(h(React.Fragment, null, [h("div", { key: "s", className: "wsx-seg-row" }, switcher), tree]), host.el);
				else body = h(React.Fragment, { key: "portals" }, [
					ReactDOM.createPortal(switcher, host.seg, "seg"),
					ReactDOM.createPortal(tree, host.el, "tree")
				]);

				return h(React.Fragment, null, [
					h("span", { key: "anchor", ref: anchor, style: { display: "none" } }),
					h(React.Fragment, { key: "body" }, body)
				]);
			};
		}

		// ---------- drop bridge (conversation dock, has inputActions) ----------
		function makeDropBridge(t) {
			return function DropBridge({ sessionId, inputActions }) {
				const [drag, setDrag] = useState(null);
				useEffect(() => {
					if (inputActions === undefined) return;
					const insert = (text) => {
						try {
							const span = inputActions.captureInsertion();
							const ok = inputActions.insertText(` ${text} `, span);
							if (!ok) console.warn("[workspace-explorer] composer refused the insertion (busy or draft changed)");
							return ok;
						} catch (error) {
							console.warn("[workspace-explorer] insert failed", error);
							return false;
						}
					};
					const ours = (e) => e.dataTransfer !== null && Array.from(e.dataTransfer.types).includes(MIME);
					const inTree = (e) => e.target instanceof Element && e.target.closest("[data-wsx-tree]") !== null;
					const onDragOver = (e) => {
						if (!ours(e) || inTree(e)) return;
						e.preventDefault();
						e.dataTransfer.dropEffect = "copy";
					};
					const onDrop = (e) => {
						if (!ours(e) || inTree(e)) return;
						let payload;
						try { payload = JSON.parse(e.dataTransfer.getData(MIME)); } catch { return; }
						if (payload.sessionId !== sessionId) return;
						e.preventDefault();
						e.stopPropagation();
						setDrag(null);
						insert(payload.text);
					};
					const onInsert = (e) => {
						if (e.detail?.sessionId === sessionId) insert(e.detail.text);
					};
					const onDrag = (e) => {
						const d = e.detail;
						setDrag(d?.active && d.sessionId === sessionId ? d : null);
					};
					window.addEventListener("dragover", onDragOver, true);
					window.addEventListener("drop", onDrop, true);
					window.addEventListener(INSERT_EVENT, onInsert);
					window.addEventListener(DRAG_EVENT, onDrag);
					return () => {
						window.removeEventListener("dragover", onDragOver, true);
						window.removeEventListener("drop", onDrop, true);
						window.removeEventListener(INSERT_EVENT, onInsert);
						window.removeEventListener(DRAG_EVENT, onDrag);
					};
				}, [sessionId, inputActions]);
				if (drag === null) return null;
				return h("div", { className: "wsx-dropzone" }, fill(t("drop"), { name: drag.name }));
			};
		}

		// ---------- composer toolbar button removed: the entry now lives in the left sidebar ----------

		const safe = (label, fn) => {
			try { return fn(); } catch (error) { console.error(`[workspace-explorer] ${label} failed`, error); return () => {}; }
		};

		return {
			inject: ["slots", "locale", "sidebarRightTabs", "remote", "remote.workspaceFiles"],
			apply(ctx) {
				console.info("[workspace-explorer] client plugin applying");
				let ReactDOM = null;
				try { ReactDOM = require("react-dom"); } catch (error) { console.warn("[workspace-explorer] react-dom unavailable", error); }
				ctx.effect(() => ensureStyle(), "workspace-explorer: styles");
				ctx.effect(() => ctx.locale.register(NS, { zh, en }), "workspace-explorer: dictionaries");
				const t = ctx.locale.bind(NS);
				ctx.effect(() => safe("tab type", () => ctx.sidebarRightTabs.register({
					id: PKG,
					kind: KIND,
					priority: "extension",
					title: () => t("type.label"),
					guide: [{
						id: "explorer",
						order: 12,
						title: () => t("guide.title"),
						description: () => t("guide.description"),
						icon: GuideIcon
					}]
				})), "workspace-explorer: tab type");
				// Host desktop open/reveal over the Session Remote (the same carrier the built-in "Show file location" uses).
				// Optional: when the Session Remote is absent the menu item renders disabled instead of blocking the plugin.
				let sessionRemote = null;
				ctx.effect(() => safe("session remote", () => ctx.inject(["remote.session"], (sub) => {
					sessionRemote = sub.remote.session;
					sub.effect(() => () => { sessionRemote = null; }, "workspace-explorer: session remote");
				})), "workspace-explorer: session remote");
				let availability = null;
				const desktop = {
					available() {
						if (sessionRemote === null) return Promise.resolve(false);
						availability ??= Promise.resolve()
							.then(() => sessionRemote.canOpenWorkspacePath())
							.then((r) => Boolean(r && r.ok && r.value), () => false);
						return availability;
					},
					async reveal(path) {
						if (sessionRemote === null) return t("menu.noDesktop");
						try {
							const r = await sessionRemote.openWorkspacePath({ path, action: "reveal" });
							if (r && r.ok) return null;
							const err = r && r.error;
							return (err && (err.message || err.kind || err.code)) || "unknown";
						} catch (error) {
							return error?.message ?? String(error);
						}
					}
				};
				const { ExplorerBody: Body, ExplorerTree } = makeBody(ctx.remote, t, ReactDOM, desktop);
				ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
					name: "sidebar.right.pane.tab",
					key: PKG
				}, Body)), "workspace-explorer: tab body");
				const Bridge = makeDropBridge(t);
				ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
					name: "conversation.input.dock",
					id: "workspace-explorer-drop",
					order: 30
				}, Bridge)), "workspace-explorer: drop bridge");
				if (ReactDOM !== null) {
					const SideFiles = makeSidebarFiles(ReactDOM, ExplorerTree, t, () => ctx.get("sidebarRight"));
					ctx.effect(() => safe("sidebar switch", () => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
						name: "sidebar.footer.action",
						id: "workspace-explorer-side",
						order: 1
					}, SideFiles))), "workspace-explorer: sidebar files switch");
				}
			}
		};
	}
});
