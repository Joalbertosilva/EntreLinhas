# Guia para professores — leitura integral (domínio público)

Material para treinar quem cadastra livros no EntreLinhas. Linguagem simples.

---

## O que o aluno vê vs o que o professor faz

| Aluno | Professor |
|-------|-----------|
| Lê **dentro** do EntreLinhas | Importa o **livro inteiro** sozinho (link ou arquivo `.txt`) |
| Não abre site externo para ler | Baixa o texto no site de domínio público quando o link automático falhar |

O campo **“URL da obra original”** é um **comprovante**: “de onde tirei a base deste livro”.  
**Não** é o link que o aluno usa. **Não** precisa ser o domínio `.gov.br` em todo caso.

---

## Passo a passo no gerenciador (com link)

1. Cadastre o **livro de estudo** (resumo, temas, reflexões) — como sempre.
2. Marque **Oferecer leitura integral** · licença **Domínio público**.
3. **Salve** o livro.
4. No Google, ache a obra e **copie o link da página** (não a home do site).
5. Cole no campo **Link da obra**.
6. **Importar do link** (HTML Gutenberg Australia ou link `.txt`) **ou** **Enviar arquivo .txt** baixado do Domínio Público / Gutenberg.

**Regra de ouro:** o professor acha a obra e importa; o aluno **não** abre sites externos para ler.

### *O Pequeno Príncipe*

- **Original completo (francês):** `https://www.gutenberg.net.au/ebooks03/0300771h.html` → **Importar do link**.
- **Em português:** não existe JSON no Gutenberg. O professor baixa **texto em PT** de fonte legal (Domínio Público, se houver) e envia o **`.txt`**. Traduções de editora **não** entram.

---

## Como pesquisar no Google (receita simples)

Ensine estes modelos de busca. O professor abre o **primeiro resultado confiável** e copia a **barra de endereço** do navegador.

### Livro brasileiro já em português (melhor caminho)

```
site:dominiopublico.gov.br "Dom Casmurro"
```

```
site:dominiopublico.gov.br Machado de Assis conto
```

- Site oficial: [Biblioteca Digital do Domínio Público](http://www.dominiopublico.gov.br/pesquisa/pesquisa.php)
- Na ficha da obra, copie a URL que aparece no navegador (página da obra).
- Licença no cadastro: **Domínio público** · método **Original já em português** (quando for o caso).

### Livro estrangeiro (original em outro idioma)

O Brasil permite usar o **texto original** quando caiu em domínio público. A tradução para o aluno vem do **JSON** (não do Google Tradutor na hora).

```
"Le Petit Prince" "Project Gutenberg Australia"
```

```
site:gutenberg.org domínio público autor falecido
```

```
site:wikisource.org título do livro
```

**Exemplo (*O Pequeno Príncipe*, original em francês):**  
`https://www.gutenberg.net.au/ebooks03/0300771h.html`

Se o Gutenberg não abrir na escola, anote o link mesmo assim ou use **Internet Archive**:

```
site:archive.org "Le Petit Prince" Saint-Exupery
```

### O que evitar nos resultados do Google

| Evite | Por quê |
|-------|---------|
| Amazon, Mercado Livre, Skoob “comprar” | Editora comercial |
| PDF “baixar livro completo” de blog duvidoso | Licença incerta |
| Traduzir e colar a edição da **Agir**, **Melhoramentos**, etc. | Tradução protegida |

**Pode** usar o Google para **achar**; **não** colar o PDF da editora no sistema.

---

## Sites que costumam aparecer (e o papel de cada um)

| Site | Para quê |
|------|----------|
| **dominiopublico.gov.br** | Obras em PT; URL da ficha = referência forte no Brasil |
| **gutenberg.net.au** / **gutenberg.org** | Originais em inglês/francês/etc. em DP |
| **wikisource.org** | Textos antigos, muitas línguas |
| **archive.org** | Cópias digitalizadas — conferir data e aviso de direitos |
| livrosdominiopublico.com.br, livris.com.br | Leitura **pessoal**; **não** copiar o texto deles para o app sem permissão |

---

## Fluxo mental em uma frase

> **Google acha a obra → professor cola o link e/ou envia o .txt → aluno lê no EntreLinhas.**

---

## Piloto rápido (*O Pequeno Príncipe*)

Sem depender de site abrir:

1. URL de referência sugerida:  
   `https://www.gutenberg.net.au/ebooks03/0300771h.html`
2. Importar: `scripts/leitura-integral/pequeno-principe-piloto.json` (amostra para teste).

---

## Perguntas que o professor vai fazer

**“Preciso copiar o link do domínio público?”**  
Só se a obra estiver **lá**. Para obra estrangeira, o link pode ser Gutenberg, Wikisource ou Archive — sempre a **página da obra**, não a home do site.

**“O aluno clica nesse link?”**  
Não. É registro interno + documentação.

**“E se só achar PDF?”**  
Não use PDF de editora. Para DP, prefira texto/HTML oficial ou JSON preparado pela equipe.

**“Preciso de arquivo JSON?”**  
Não. O fluxo normal é **link da página** (Gutenberg AU) ou **arquivo .txt** do site. JSON é opcional (backup técnico).

---

## Referências no projeto

- Custos zero: `docs/leitura-integral-custos-zero.md`
- Import técnico: `scripts/leitura-integral/README.md`