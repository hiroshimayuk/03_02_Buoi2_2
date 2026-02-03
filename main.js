async function getData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById('table_body');
        body.innerHTML = '';
        for (const post of posts) {
            // YÊU CẦU 2: Hiển thị gạch ngang nếu là xoá mềm
            // Kiểm tra thuộc tính isDeleted, nếu true thì thêm style gạch ngang và màu xám
            let rowStyle = post.isDeleted ? 'text-decoration: line-through; color: gray;' : '';
            
            body.innerHTML += `<tr style="${rowStyle}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    <input type='submit' value='Delete' onclick='Delete("${post.id}")'>
                </td>
            </tr>`
        }
    } catch (error) {
        console.log(error);
    }
}

async function Save() {
    let id = document.getElementById('txt_id').value;
    let title = document.getElementById('txt_title').value;
    let views = document.getElementById('txt_views').value;

    // YÊU CẦU 3: ID tự tăng (khi tạo mới thì bỏ trống ID)
    if (!id) {
        // Logic TẠO MỚI (Create)
        try {
            // Lấy danh sách hiện tại để tìm Max ID
            let res = await fetch('http://localhost:3000/posts');
            let posts = await res.json();
            
            // Tìm ID lớn nhất. Chuyển id sang số (Int) để so sánh chính xác
            let maxId = 0;
            if (posts.length > 0) {
                // Map mảng post thành mảng id số, sau đó tìm max
                maxId = Math.max(...posts.map(p => parseInt(p.id)));
            }
            
            // ID mới = Max ID + 1
            let newId = maxId + 1;

            // Gửi request tạo mới
            let createRes = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: newId.toString(), // Convert lại thành string cho đồng bộ
                    title: title,
                    views: views,
                    isDeleted: false // Mặc định chưa xoá
                })
            });

            if (createRes.ok) {
                console.log("Thêm mới thành công");
                // Clear form sau khi thêm
                document.getElementById('txt_title').value = '';
                document.getElementById('txt_views').value = '';
                getData();
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        // Logic CẬP NHẬT (Update) - Giữ nguyên logic cũ nhưng tối ưu
        let checkRes = await fetch('http://localhost:3000/posts/' + id);
        if (checkRes.ok) {
            // Dùng PATCH để không ghi đè mất thuộc tính isDeleted nếu có
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PATCH', 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views
                })
            });
            if (res.ok) {
                console.log("Cập nhật thành công");
                getData();
            }
        } else {
            alert("ID không tồn tại để cập nhật!");
        }
    }
}

async function Delete(id) {
    // YÊU CẦU 1: Chuyển xoá cứng (DELETE) thành xoá mềm (PATCH + isDeleted: true)
    try {
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PATCH', // Dùng PATCH để cập nhật 1 phần
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                isDeleted: true
            })
        });

        if (res.ok) {
            console.log("Đã xoá mềm thành công");
            getData(); // Tải lại bảng để thấy gạch ngang
        }
    } catch (error) {
        console.log(error);
    }
}

// Khởi chạy
getData();