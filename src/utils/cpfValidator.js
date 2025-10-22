const validateCPF = (cpf) => {
  const cpfClean = cpf.replace(/\D/g, '');
  
  if (cpfClean.length !== 11) {
    return false;
  }
  
  if (/^(\d)\1{10}$/.test(cpfClean)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfClean.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfClean.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfClean.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfClean.charAt(10))) return false;
  
  return true;
};

module.exports = { validateCPF };