-- Business ID tăng dần với bước nhảy ngẫu nhiên 1..v_max_step để khó đoán mã kế tiếp.
-- Giữ nguyên signature (p_table_name TEXT) vì các cột DEFAULT đang gọi hàm này.

CREATE OR REPLACE FUNCTION "generateBusinessID"(p_table_name TEXT)
RETURNS VARCHAR(14)
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_step CONSTANT INTEGER := 50;
    v_date DATE := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
    v_step INTEGER := 1 + FLOOR(RANDOM() * v_max_step)::INTEGER;
    v_seq  INTEGER;
BEGIN
    INSERT INTO "BusinessIdCounter" ("tableName", "counterDate", "lastValue")
    VALUES (p_table_name, v_date, v_step)
    ON CONFLICT ("tableName", "counterDate")
    DO UPDATE SET "lastValue" = "BusinessIdCounter"."lastValue" + v_step
    RETURNING "lastValue" INTO v_seq;

    IF v_seq > 999999 THEN
        RAISE EXCEPTION 'Business ID overflow for % on %', p_table_name, v_date;
    END IF;

    RETURN TO_CHAR(v_date, 'YYYYMMDD') || LPAD(v_seq::TEXT, 6, '0');
END;
$$;
