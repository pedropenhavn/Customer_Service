# Melhorias na Normalização de Comparação de Dados

## Problema Identificado

O sistema de validação estava rejeitando clientes por diferenças superficiais nos dados, como:

- **Diferenças de maiúsculas/minúsculas**: "ARACOIABA DA SERRA" vs "Araçoiaba da Serra"
- **Caracteres especiais**: "AV LUANE MILANDA OLIVEIRA" vs "LUANE MILANDA OLIVEIRA"
- **Acentos**: "SÃO PAULO" vs "SAO PAULO"

## Solução Implementada

### 1. Função de Normalização Inteligente

Implementada nos serviços:
- `CnpjWsService`
- `SintegraService` 
- `ViaCepService`

A função `normalizeText()` realiza as seguintes operações:

1. **Converte para minúsculas**
2. **Remove acentos** (á → a, ã → a, ç → c, etc.)
3. **Remove prefixos de logradouro** (AV, Rua, Avenida, etc.)
4. **Remove caracteres especiais** (mantém apenas letras, números e espaços)
5. **Normaliza espaços** (remove espaços múltiplos)

### 2. Função de Comparação Inteligente

A função `compareValues()` compara dois valores após normalização, garantindo que diferenças superficiais não causem rejeições desnecessárias.

### 3. Prefixos de Logradouro Suportados

O sistema remove automaticamente os seguintes prefixos:
- AV, Avenida
- Rua, R
- Travessa, Trav
- Alameda, Ala
- Estrada, Est
- Rodovia, Rod
- Via
- Vila, Vl
- Largo, Lg
- Praça, Pc

## Exemplos de Funcionamento

### Antes da Melhoria
```json
{
  "campo": "cidade",
  "valor_cliente": "ARACOIABA DA SERRA",
  "valor_cnpjws": "Araçoiaba da Serra",
  "resultado": "DIFERENTE ❌"
}
```

### Após a Melhoria
```json
{
  "campo": "cidade", 
  "valor_cliente": "ARACOIABA DA SERRA",
  "valor_cnpjws": "Araçoiaba da Serra",
  "normalizado_cliente": "aracoiaba da serra",
  "normalizado_cnpjws": "aracoiaba da serra",
  "resultado": "IGUAL ✅"
}
```

## Testes Realizados

✅ Cidade com acentos e maiúsculas  
✅ Logradouro com prefixo AV  
✅ Estado com e sem acento  
✅ Endereço com e sem vírgula  
✅ Bairro com diferença de maiúsculas  
✅ Cidade com acentos e maiúsculas  
✅ Endereço idêntico  
✅ Cidades diferentes (deve falhar)  

**Taxa de sucesso: 100%**

## Benefícios

1. **Redução de falsos positivos**: Menos clientes rejeitados por diferenças superficiais
2. **Maior precisão**: Comparação mais inteligente e contextual
3. **Flexibilidade**: Suporte a diferentes formatos de entrada
4. **Consistência**: Mesma lógica aplicada em todos os serviços de validação

## Arquivos Modificados

- `app/Services/CnpjWsService.php`
- `app/Services/SintegraService.php`
- `app/Services/ViaCepService.php`

## Como Usar

A melhoria é automática e transparente. Todos os campos de endereço (logradouro, cidade, estado, bairro) agora são comparados usando a normalização inteligente.

Não é necessário alterar nenhum código existente - a melhoria é retrocompatível.
