-- Meslektaş · temel veritabanı (30 Ekim 2026)
-- Kural: oyuncu XP ve rozeti kendisi YAZAMAZ. Yalnızca gorev_tamamla() fonksiyonu yazar;
-- XP miktarı ve kilit kontrolü sunucuda, meslek paketinden hesaplanır.

create table public.meslek_paketleri (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  ad text not null,
  surum int not null default 1,
  paket jsonb not null,
  yayinda boolean not null default false,
  uzman_onayi boolean not null default false,
  guncellendi timestamptz not null default now()
);
alter table public.meslek_paketleri enable row level security;
create policy "yayindaki paketleri herkes okur" on public.meslek_paketleri
  for select to anon, authenticated using (yayinda);

create table public.profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  gorunen_ad text check (gorunen_ad is null or char_length(gorunen_ad) between 1 and 40),
  olusturuldu timestamptz not null default now()
);
alter table public.profiller enable row level security;
create policy "kendi profilini okur" on public.profiller for select to authenticated using ((select auth.uid()) = id);
create policy "kendi profilini ekler" on public.profiller for insert to authenticated with check ((select auth.uid()) = id);
create policy "kendi profilini gunceller" on public.profiller for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table public.gorev_sonuclari (
  user_id uuid not null references auth.users(id) on delete cascade,
  meslek_id text not null references public.meslek_paketleri(id) on delete cascade,
  gorev_id text not null,
  yildiz smallint not null check (yildiz between 0 and 3),
  xp int not null check (xp >= 0),
  deneme int not null default 1,
  ilk_tamamlama timestamptz not null default now(),
  son_tamamlama timestamptz not null default now(),
  primary key (user_id, meslek_id, gorev_id)
);
alter table public.gorev_sonuclari enable row level security;
create policy "kendi sonuclarini okur" on public.gorev_sonuclari for select to authenticated using ((select auth.uid()) = user_id);

create table public.rozetler (
  user_id uuid not null references auth.users(id) on delete cascade,
  meslek_id text not null references public.meslek_paketleri(id) on delete cascade,
  kademe_sira int not null,
  rozet_ad text not null,
  kazanildi timestamptz not null default now(),
  primary key (user_id, meslek_id, kademe_sira)
);
alter table public.rozetler enable row level security;
create policy "kendi rozetlerini okur" on public.rozetler for select to authenticated using ((select auth.uid()) = user_id);

-- Görev tamamlama: tek yazma kapısı
create or replace function public.gorev_tamamla(p_meslek text, p_gorev text, p_yildiz int)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_paket jsonb;
  v_kademe jsonb; v_kidx int; v_gidx int; v_gorev jsonb := null; v_gorevler jsonb;
  v_sablon text; v_xp int; v_yildiz int; v_onceki text; v_rozet jsonb := null; v_son boolean;
begin
  if v_uid is null then raise exception 'giris_gerekli'; end if;
  if p_yildiz is null or p_yildiz < 0 or p_yildiz > 3 then raise exception 'gecersiz_yildiz'; end if;

  select paket into v_paket from public.meslek_paketleri where id = p_meslek and yayinda;
  if v_paket is null then raise exception 'meslek_yok'; end if;

  -- not: plpgsql FOR sayaçları döngü dışında görünmez; bu yüzden WHILE kullanılıyor
  v_kidx := 0;
  while v_gorev is null and v_kidx < jsonb_array_length(v_paket->'kademeler') loop
    v_gorevler := v_paket->'kademeler'->v_kidx->'gorevler';
    v_gidx := 0;
    while v_gidx < jsonb_array_length(v_gorevler) loop
      if v_gorevler->v_gidx->>'id' = p_gorev then
        v_gorev := v_gorevler->v_gidx; v_kademe := v_paket->'kademeler'->v_kidx; exit;
      end if;
      v_gidx := v_gidx + 1;
    end loop;
    if v_gorev is null then v_kidx := v_kidx + 1; end if;
  end loop;
  if v_gorev is null then raise exception 'gorev_yok'; end if;

  -- kilit: kademe açık mı?
  if v_kidx > 0 and coalesce((v_kademe->>'acikBaslar')::boolean, false) = false then
    v_gorevler := v_paket->'kademeler'->(v_kidx-1)->'gorevler';
    v_onceki := v_gorevler->(jsonb_array_length(v_gorevler)-1)->>'id';
    if not exists (select 1 from public.gorev_sonuclari where user_id=v_uid and meslek_id=p_meslek and gorev_id=v_onceki) then
      raise exception 'kademe_kilitli';
    end if;
  end if;
  -- kilit: önceki görev bitti mi?
  if v_gidx > 0 then
    v_onceki := v_kademe->'gorevler'->(v_gidx-1)->>'id';
    if not exists (select 1 from public.gorev_sonuclari where user_id=v_uid and meslek_id=p_meslek and gorev_id=v_onceki) then
      raise exception 'gorev_kilitli';
    end if;
  end if;

  -- XP sunucuda hesaplanır
  v_sablon := v_gorev->>'sablon';
  if v_sablon in ('bilgi','uyum') then
    v_yildiz := 3; v_xp := (v_gorev->>'xp')::int;
  elsif v_sablon = 'sinav' then
    if p_yildiz < 3 then raise exception 'sinav_gecilmedi'; end if;
    v_yildiz := 3; v_xp := (v_gorev->>'xp')::int;
  elsif v_sablon = 'siralama' then
    v_yildiz := greatest(p_yildiz,1);
    v_xp := (v_gorev->'puanlama'->>'temelXp')::int + v_yildiz * (v_gorev->'puanlama'->>'yildizBasinaXp')::int;
  else
    v_yildiz := greatest(p_yildiz,1);
    v_xp := (v_gorev->>'temelXp')::int + v_yildiz * (v_gorev->>'yildizBasinaXp')::int;
  end if;

  insert into public.gorev_sonuclari as g (user_id, meslek_id, gorev_id, yildiz, xp)
  values (v_uid, p_meslek, p_gorev, v_yildiz, v_xp)
  on conflict (user_id, meslek_id, gorev_id) do update
    set yildiz = greatest(g.yildiz, excluded.yildiz), xp = greatest(g.xp, excluded.xp),
        deneme = g.deneme + 1, son_tamamlama = now();

  -- kademenin son görevi (sınav) bittiyse rozet
  v_son := v_gidx = jsonb_array_length(v_kademe->'gorevler') - 1;
  if v_son then
    insert into public.rozetler (user_id, meslek_id, kademe_sira, rozet_ad)
    values (v_uid, p_meslek, v_kidx, v_kademe->'rozet'->>'ad')
    on conflict do nothing;
    v_rozet := v_kademe->'rozet';
  end if;

  return jsonb_build_object('xp', v_xp, 'yildiz', v_yildiz, 'rozet', v_rozet,
    'toplamXp', (select coalesce(sum(xp),0) from public.gorev_sonuclari where user_id=v_uid and meslek_id=p_meslek));
end;
$$;
revoke all on function public.gorev_tamamla(text,text,int) from public, anon;
grant execute on function public.gorev_tamamla(text,text,int) to authenticated;
