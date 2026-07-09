import os
import re

files_to_fix = [
    'src/Screen/Auth/Login.tsx',
    'src/Screen/Auth/Register.tsx',
    'src/Screen/Auth/ForgotPassword.tsx',
    'src/Screen/Auth/ChangePassword.tsx',
    'src/Screen/Auth/OtpVerification.tsx',
    'src/Screen/Auth/Profile.tsx',
    'src/Screen/Auth/EditProfile.tsx',
    'src/Screen/Results/ResultScreen.tsx',
    'src/Screen/MockTestQuestion/MockTestQuestionScreen.tsx',
    'src/Screen/MockTestRules/MockTestRulesScreen.tsx',
    'src/Screen/Subject/PYQ.tsx',
    'src/Screen/CoursesScreen/CoursesScreen.tsx',
    'src/Screen/CoursesPaymentHistoryScreen/CoursesPaymentHistoryScreen.tsx',
    'src/Screen/SubjectTests/index.tsx',
]

base_dir = '/Users/emedevents/MobileApp/Nursetra_app/'

for rel_path in files_to_fix:
    path = os.path.join(base_dir, rel_path)
    if not os.path.exists(path):
        print(f"Skipping {path}, does not exist.")
        continue
        
    with open(path, 'r') as f:
        content = f.read()

    # Skip if already has useSafeAreaInsets
    if 'useSafeAreaInsets' in content:
        print(f"Skipping {rel_path}, already has useSafeAreaInsets.")
        continue
        
    print(f"Patching {rel_path}...")
    
    # 1. Add import
    import_statement = "import { useSafeAreaInsets } from 'react-native-safe-area-context';\n"
    # Find last import
    last_import_match = list(re.finditer(r'^import .*;', content, re.MULTILINE))
    if last_import_match:
        last_import = last_import_match[-1]
        insert_pos = last_import.end() + 1
        content = content[:insert_pos] + import_statement + content[insert_pos:]
    else:
        content = import_statement + content

    # 2. Add const insets = useSafeAreaInsets(); inside the component
    # Match standard component signatures
    component_pattern = r'(export const \w+\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)\s*=>\s*\{|const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)'
    comp_match = re.search(component_pattern, content)
    if comp_match:
        insert_pos = comp_match.end()
        hook_statement = "\n  const insets = useSafeAreaInsets();"
        content = content[:insert_pos] + hook_statement + content[insert_pos:]
    else:
        print(f"Warning: Could not find component body in {rel_path}")

    # 3. Add paddingBottom to styles.container
    # <View style={styles.container}> -> <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
    # OR <SafeAreaView style={styles.container}> -> <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
    
    content = re.sub(
        r'<View style=\{styles\.container\}>', 
        r'<View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>', 
        content
    )
    content = re.sub(
        r'<SafeAreaView style=\{styles\.container\}>', 
        r'<SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>', 
        content
    )
    # Some might use edges
    content = re.sub(
        r"<SafeAreaView style=\{styles\.container\} edges=\{\['top', 'left', 'right'\]\}>", 
        r"<SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]} edges={['top', 'left', 'right']}>", 
        content
    )

    # Specific fixes for ResultScreen or others that might use a custom outer view
    # E.g. <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    content = re.sub(
        r"<SafeAreaView style=\{\{ flex: 1, backgroundColor: '#fff' \}\}>", 
        r"<SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingBottom: Math.max(insets.bottom, 0) }}>", 
        content
    )

    with open(path, 'w') as f:
        f.write(content)
    print(f"Patched {rel_path} successfully!")
