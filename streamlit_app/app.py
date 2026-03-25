import streamlit as st
import pymssql

st.set_page_config(page_title="資料維護系統", layout="wide")

# 除錯：顯示目前讀到的 secrets keys
with st.expander("🔧 除錯資訊（確認後刪除）"):
    st.write("Secrets keys:", list(st.secrets.keys()) if st.secrets else "（空）")

# ──────────────────────────────────────────
# DB 工具函數
# ──────────────────────────────────────────
def get_conn():
    s = st.secrets
    server = f"{s['DB_SERVER']}:{s['DB_PORT']}"
    return pymssql.connect(
        server=server,
        database=s["DB_NAME"],
        user=s["DB_USER"],
        password=s["DB_PASSWORD"],
        charset="UTF-8",
        login_timeout=10,
    )

def db_fetch(sql, params=()):
    conn = get_conn()
    cur = conn.cursor(as_dict=True)
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows

def db_exec(sql, params=()):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql, params)
    conn.commit()
    conn.close()

# ──────────────────────────────────────────
# Session state 初始化
# ──────────────────────────────────────────
for k, v in [("logged_in", False), ("user", {}), ("page", "main")]:
    if k not in st.session_state:
        st.session_state[k] = v

# ──────────────────────────────────────────
# 登入頁
# ──────────────────────────────────────────
if not st.session_state.logged_in:
    st.markdown("<h2 style='text-align:center;margin-top:80px'>資料維護系統</h2>", unsafe_allow_html=True)
    col = st.columns([1, 1, 1])[1]
    with col:
        with st.form("login"):
            userid = st.text_input("用戶代碼")
            pwd    = st.text_input("密碼", type="password")
            if st.form_submit_button("登入", use_container_width=True):
                try:
                    rows = db_fetch(
                        "SELECT userid, username FROM [user] WHERE userid=%s AND pwd=%s",
                        (userid, pwd),
                    )
                    if rows:
                        st.session_state.logged_in = True
                        st.session_state.user = rows[0]
                        st.rerun()
                    else:
                        st.error("帳號或密碼錯誤")
                except Exception as e:
                    st.error(f"連線失敗：{e}")
    st.stop()

# ──────────────────────────────────────────
# 側邊選單（登入後）
# ──────────────────────────────────────────
with st.sidebar:
    st.markdown(f"**👤 {st.session_state.user.get('username', '')}**")
    st.divider()
    pages = {
        "main": "🏠 主選單",
        "cust": "客戶資料維護",
        "fact": "廠商資料維護",
        "item": "商品資料維護",
        "user": "用戶資料維護",
    }
    for key, label in pages.items():
        if st.button(label, use_container_width=True, key=f"nav_{key}"):
            st.session_state.page = key
            st.rerun()
    st.divider()
    if st.button("登出", use_container_width=True):
        st.session_state.logged_in = False
        st.session_state.user = {}
        st.session_state.page = "main"
        st.rerun()

page = st.session_state.page

# ──────────────────────────────────────────
# 主選單
# ──────────────────────────────────────────
if page == "main":
    st.title("資料維護系統")
    st.write(f"歡迎，**{st.session_state.user.get('username', '')}**！請選擇功能：")
    st.write("")
    c1, c2 = st.columns(2)
    with c1:
        if st.button("客戶資料維護", use_container_width=True, key="m_cust"):
            st.session_state.page = "cust"; st.rerun()
        if st.button("商品資料維護", use_container_width=True, key="m_item"):
            st.session_state.page = "item"; st.rerun()
    with c2:
        if st.button("廠商資料維護", use_container_width=True, key="m_fact"):
            st.session_state.page = "fact"; st.rerun()
        if st.button("用戶資料維護", use_container_width=True, key="m_user"):
            st.session_state.page = "user"; st.rerun()

# ──────────────────────────────────────────
# 客戶資料維護
# ──────────────────────────────────────────
elif page == "cust":
    st.title("客戶資料維護")
    kw = st.text_input("搜尋（代碼／名稱）", key="cust_kw")
    if kw:
        rows = db_fetch(
            "SELECT * FROM cust WHERE cust_code LIKE %s OR cust_name LIKE %s ORDER BY cust_code",
            (f"%{kw}%", f"%{kw}%"),
        )
    else:
        rows = db_fetch("SELECT * FROM cust ORDER BY cust_code")

    st.dataframe(rows, use_container_width=True, hide_index=True)
    st.divider()

    tab1, tab2, tab3 = st.tabs(["新增", "修改", "刪除"])

    with tab1:
        with st.form("cust_add"):
            code = st.text_input("客戶代碼")
            name = st.text_input("客戶名稱")
            remark = st.text_input("備註說明")
            if st.form_submit_button("新增"):
                try:
                    db_exec("INSERT INTO cust VALUES (%s,%s,%s)", (code, name, remark))
                    st.success("新增成功"); st.rerun()
                except Exception as e:
                    st.error(f"新增失敗：{e}")

    with tab2:
        if rows:
            keys = [r["cust_code"] for r in rows]
            sel = st.selectbox("選擇客戶代碼", keys, key="cust_edit_sel")
            rec = next(r for r in rows if r["cust_code"] == sel)
            with st.form("cust_edit"):
                st.text_input("客戶代碼", value=rec["cust_code"], disabled=True)
                name   = st.text_input("客戶名稱", value=rec["cust_name"])
                remark = st.text_input("備註說明", value=rec["remark"] or "")
                if st.form_submit_button("儲存"):
                    try:
                        db_exec("UPDATE cust SET cust_name=%s, remark=%s WHERE cust_code=%s",
                                (name, remark, sel))
                        st.success("修改成功"); st.rerun()
                    except Exception as e:
                        st.error(f"修改失敗：{e}")

    with tab3:
        if rows:
            keys = [r["cust_code"] for r in rows]
            sel = st.selectbox("選擇客戶代碼", keys, key="cust_del_sel")
            if st.button("確認刪除", type="primary", key="cust_del_btn"):
                try:
                    db_exec("DELETE FROM cust WHERE cust_code=%s", (sel,))
                    st.success("刪除成功"); st.rerun()
                except Exception as e:
                    st.error(f"刪除失敗：{e}")

# ──────────────────────────────────────────
# 廠商資料維護
# ──────────────────────────────────────────
elif page == "fact":
    st.title("廠商資料維護")
    kw = st.text_input("搜尋（代碼／名稱）", key="fact_kw")
    if kw:
        rows = db_fetch(
            "SELECT * FROM fact WHERE fact_code LIKE %s OR fact_name LIKE %s ORDER BY fact_code",
            (f"%{kw}%", f"%{kw}%"),
        )
    else:
        rows = db_fetch("SELECT * FROM fact ORDER BY fact_code")

    st.dataframe(rows, use_container_width=True, hide_index=True)
    st.divider()

    tab1, tab2, tab3 = st.tabs(["新增", "修改", "刪除"])

    with tab1:
        with st.form("fact_add"):
            code   = st.text_input("廠商代碼")
            name   = st.text_input("廠商名稱")
            remark = st.text_input("備註說明")
            if st.form_submit_button("新增"):
                try:
                    db_exec("INSERT INTO fact VALUES (%s,%s,%s)", (code, name, remark))
                    st.success("新增成功"); st.rerun()
                except Exception as e:
                    st.error(f"新增失敗：{e}")

    with tab2:
        if rows:
            keys = [r["fact_code"] for r in rows]
            sel = st.selectbox("選擇廠商代碼", keys, key="fact_edit_sel")
            rec = next(r for r in rows if r["fact_code"] == sel)
            with st.form("fact_edit"):
                st.text_input("廠商代碼", value=rec["fact_code"], disabled=True)
                name   = st.text_input("廠商名稱", value=rec["fact_name"])
                remark = st.text_input("備註說明", value=rec["remark"] or "")
                if st.form_submit_button("儲存"):
                    try:
                        db_exec("UPDATE fact SET fact_name=%s, remark=%s WHERE fact_code=%s",
                                (name, remark, sel))
                        st.success("修改成功"); st.rerun()
                    except Exception as e:
                        st.error(f"修改失敗：{e}")

    with tab3:
        if rows:
            keys = [r["fact_code"] for r in rows]
            sel = st.selectbox("選擇廠商代碼", keys, key="fact_del_sel")
            if st.button("確認刪除", type="primary", key="fact_del_btn"):
                try:
                    db_exec("DELETE FROM fact WHERE fact_code=%s", (sel,))
                    st.success("刪除成功"); st.rerun()
                except Exception as e:
                    st.error(f"刪除失敗：{e}")

# ──────────────────────────────────────────
# 商品資料維護
# ──────────────────────────────────────────
elif page == "item":
    st.title("商品資料維護")
    kw = st.text_input("搜尋（代碼／名稱）", key="item_kw")
    if kw:
        rows = db_fetch(
            """SELECT i.item_code, i.item_name, i.fact_code, f.fact_name
               FROM item i LEFT JOIN fact f ON i.fact_code=f.fact_code
               WHERE i.item_code LIKE %s OR i.item_name LIKE %s
               ORDER BY i.item_code""",
            (f"%{kw}%", f"%{kw}%"),
        )
    else:
        rows = db_fetch(
            """SELECT i.item_code, i.item_name, i.fact_code, f.fact_name
               FROM item i LEFT JOIN fact f ON i.fact_code=f.fact_code
               ORDER BY i.item_code"""
        )

    facts = db_fetch("SELECT fact_code, fact_name FROM fact ORDER BY fact_code")
    fact_options = {f["fact_code"]: f"{f['fact_code']} - {f['fact_name']}" for f in facts}
    fact_keys = list(fact_options.keys())

    st.dataframe(rows, use_container_width=True, hide_index=True)
    st.divider()

    tab1, tab2, tab3 = st.tabs(["新增", "修改", "刪除"])

    with tab1:
        with st.form("item_add"):
            code      = st.text_input("商品代碼")
            name      = st.text_input("商品名稱")
            fact_sel  = st.selectbox("主供應商", [""] + fact_keys,
                                     format_func=lambda x: fact_options.get(x, "-- 請選擇 --"))
            if st.form_submit_button("新增"):
                try:
                    db_exec("INSERT INTO item VALUES (%s,%s,%s)",
                            (code, name, fact_sel or None))
                    st.success("新增成功"); st.rerun()
                except Exception as e:
                    st.error(f"新增失敗：{e}")

    with tab2:
        if rows:
            keys = [r["item_code"] for r in rows]
            sel = st.selectbox("選擇商品代碼", keys, key="item_edit_sel")
            rec = next(r for r in rows if r["item_code"] == sel)
            with st.form("item_edit"):
                st.text_input("商品代碼", value=rec["item_code"], disabled=True)
                name = st.text_input("商品名稱", value=rec["item_name"])
                cur_fact = rec["fact_code"] or ""
                fact_list = [""] + fact_keys
                idx = fact_list.index(cur_fact) if cur_fact in fact_list else 0
                fact_sel = st.selectbox("主供應商", fact_list, index=idx,
                                        format_func=lambda x: fact_options.get(x, "-- 請選擇 --"))
                if st.form_submit_button("儲存"):
                    try:
                        db_exec("UPDATE item SET item_name=%s, fact_code=%s WHERE item_code=%s",
                                (name, fact_sel or None, sel))
                        st.success("修改成功"); st.rerun()
                    except Exception as e:
                        st.error(f"修改失敗：{e}")

    with tab3:
        if rows:
            keys = [r["item_code"] for r in rows]
            sel = st.selectbox("選擇商品代碼", keys, key="item_del_sel")
            if st.button("確認刪除", type="primary", key="item_del_btn"):
                try:
                    db_exec("DELETE FROM item WHERE item_code=%s", (sel,))
                    st.success("刪除成功"); st.rerun()
                except Exception as e:
                    st.error(f"刪除失敗：{e}")

# ──────────────────────────────────────────
# 用戶資料維護
# ──────────────────────────────────────────
elif page == "user":
    st.title("用戶資料維護")
    kw = st.text_input("搜尋（代碼／名稱）", key="user_kw")
    if kw:
        rows = db_fetch(
            "SELECT userid, username, pwd FROM [user] WHERE userid LIKE %s OR username LIKE %s ORDER BY userid",
            (f"%{kw}%", f"%{kw}%"),
        )
    else:
        rows = db_fetch("SELECT userid, username, pwd FROM [user] ORDER BY userid")

    st.dataframe(rows, use_container_width=True, hide_index=True)
    st.divider()

    tab1, tab2, tab3 = st.tabs(["新增", "修改", "刪除"])

    with tab1:
        with st.form("user_add"):
            userid   = st.text_input("用戶代碼")
            username = st.text_input("用戶名稱")
            pwd      = st.text_input("密碼")
            if st.form_submit_button("新增"):
                try:
                    db_exec("INSERT INTO [user] VALUES (%s,%s,%s)", (userid, username, pwd))
                    st.success("新增成功"); st.rerun()
                except Exception as e:
                    st.error(f"新增失敗：{e}")

    with tab2:
        if rows:
            keys = [r["userid"] for r in rows]
            sel = st.selectbox("選擇用戶代碼", keys, key="user_edit_sel")
            rec = next(r for r in rows if r["userid"] == sel)
            with st.form("user_edit"):
                st.text_input("用戶代碼", value=rec["userid"], disabled=True)
                username = st.text_input("用戶名稱", value=rec["username"])
                pwd      = st.text_input("密碼", value=rec["pwd"])
                if st.form_submit_button("儲存"):
                    try:
                        db_exec("UPDATE [user] SET username=%s, pwd=%s WHERE userid=%s",
                                (username, pwd, sel))
                        st.success("修改成功"); st.rerun()
                    except Exception as e:
                        st.error(f"修改失敗：{e}")

    with tab3:
        if rows:
            keys = [r["userid"] for r in rows]
            sel = st.selectbox("選擇用戶代碼", keys, key="user_del_sel")
            if st.button("確認刪除", type="primary", key="user_del_btn"):
                try:
                    db_exec("DELETE FROM [user] WHERE userid=%s", (sel,))
                    st.success("刪除成功"); st.rerun()
                except Exception as e:
                    st.error(f"刪除失敗：{e}")
