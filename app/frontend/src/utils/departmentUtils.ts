// Утилиты для работы с подразделениями

export const isRegionalDepartment = (departmentTitle: string, departmentTree?: any[]): boolean => {
  const upperTitle = departmentTitle.toUpperCase();
  
  // Список ФО (Федеральных округов) - только они считаются регионами
  const foKeywords = [
    'МОСКВА', 'ЦЕНТР', 'СЗ', 'ПОВОЛЖЬЕ', 'ЮГ', 'СИБИРЬ', 'ДАЛЬНИЙ ВОСТОК', 'УРАЛ'
  ];
  
  console.log('Checking department:', departmentTitle);
  
  // Проверяем, является ли само подразделение ФО
  if (foKeywords.some(keyword => upperTitle.includes(keyword))) {
    console.log('Direct FO match:', departmentTitle);
    return true;
  }
  
  // Если передан tree, проверяем родительские департаменты
  if (departmentTree) {
    const findDepartmentInTree = (tree: any[], title: string): any => {
      for (const dept of tree) {
        if (dept.title === title) {
          return dept;
        }
        if (dept.children) {
          const found = findDepartmentInTree(dept.children, title);
          if (found) return found;
        }
      }
      return null;
    };
    
    const department = findDepartmentInTree(departmentTree, departmentTitle);
    console.log('Found department in tree:', department);
    
    if (department) {
      // Проверяем, является ли родительский департамент ФО
      const checkParentIsFO = (dept: any): boolean => {
        if (!dept.parent) return false;
        const parentTitle = dept.parent.title.toUpperCase();
        console.log('Checking parent:', dept.parent.title);
        if (foKeywords.some(keyword => parentTitle.includes(keyword))) {
          console.log('Parent is FO:', dept.parent.title);
          return true;
        }
        return checkParentIsFO(dept.parent);
      };
      
      const result = checkParentIsFO(department);
      console.log('Parent FO check result:', result);
      return result;
    }
  }
  
  console.log('Not FO:', departmentTitle);
  return false;
};

export const shouldShowApprovalStatus = (departmentTitle: string, departmentTree?: any[]): boolean => {
  return isRegionalDepartment(departmentTitle, departmentTree);
};
