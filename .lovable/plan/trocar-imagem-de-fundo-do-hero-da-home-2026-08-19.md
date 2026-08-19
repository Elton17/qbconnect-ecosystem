# Trocar imagem de fundo do hero da home

Substituir a foto atual do hero (`/images/hero-bg.jpg`) pela foto enviada da sede da QBCAMP, mantendo a legibilidade do texto e a identidade visual.

## O que será feito

1. **Subir a nova foto como Asset da Lovable**
   - Usar a imagem enviada (`user-uploads://IMG_2808-2.jpg`) e criar um ponteiro CDN em `src/assets/hero-bg.jpg.asset.json`.
   - Isso evita deixar o arquivo binário grande no repositório e aproveita a entrega via CDN.

2. **Atualizar o hero em `src/pages/LandingPage.tsx`**
   - Trocar o `backgroundImage` de `url('/images/hero-bg.jpg')` para a URL do asset recém-criado.
   - Ajustar o gradiente de overlay se necessário para garantir que o texto branco continue legível sobre a foto real.

3. **Remover a imagem antiga**
   - Apagar `public/images/hero-bg.jpg`, já que não será mais referenciada.
   - Verificar se a pasta `public/images/` fica vazia e, em caso positivo, removê-la também.

4. **Verificar no preview**
   - Abrir `/home` no preview e confirmar que a nova imagem carrega, o texto está legível e a foto não fica distorcida.

## Detalhes técnicos

- A referência atual é inline em `style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}`.
- O novo asset será importado como JSON e sua propriedade `.url` usada no inline style.
- O overlay atual (`linear-gradient(to right, rgba(26,26,26,0.92) 40%, rgba(26,26,26,0.60) 100%)`) será mantido como base, com ajuste pontual de opacidade se o contraste exigir.
