-- Recepção: troca "como conheceu" por bairro + ponto de referência, campos
-- mais úteis para localizar e visitar o visitante depois.

alter table visitantes drop column if exists como_conheceu;
alter table visitantes add column if not exists bairro text;
alter table visitantes add column if not exists ponto_referencia text;
